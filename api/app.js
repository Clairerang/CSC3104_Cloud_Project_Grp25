const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { User, Relationship, Engagement } = require('./models');

const app = express();
const port = 8080;

app.use(express.json());
const JWT_SECRET = 'secret1234@';

// Proxy /games requests to games-service
const GAMES_SERVICE_URL = process.env.GAMES_SERVICE_URL || 'http://games-service:8081';
app.use('/games', createProxyMiddleware({
  target: GAMES_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/games': '', // Remove /games prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.path} -> ${GAMES_SERVICE_URL}${req.path}`);
  },
  onError: (err, req, res) => {
    console.error('[Proxy Error]', err);
    res.status(500).json({ error: 'Games service unavailable' });
  }
}));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/senior_care';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB!'))
.catch(err => console.error('MongoDB connection error:', err));

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

app.get('/', (req, res) => {
  res.send('Welcome to the homepage');
});

app.get('/about', (req, res) => {
  res.send('About page');
});


// auth
app.post('/register', async (req, res) => {
  try {
    const { username, password, role, profile } = req.body;
    if (
      !username ||
      !password ||
      !role ||
      !profile?.name ||
      profile?.age === undefined ||
      !profile?.email ||
      !profile?.contact
    ) {
      return res.status(400).json({
        error: "All fields are required: username, password, role, name, age, email, contact"
      });
    }

    const validRoles = ['senior', 'family'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'senior' or 'family'" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({
      $or: [
        { username },
        { "profile.email": profile.email }
      ]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username already exists" });
      }
      if (existingUser.profile?.email === profile.email) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId,
      username,
      passwordHash: hashedPassword,
      role,
      profile: {
        name: profile?.name || "",
        age: profile?.age || null,
        email: profile.email,
        contact: profile?.contact || ""
      },
    });

    await newUser.save();

    res.status(201).json({
      message: `User ${username} created successfully`,
      userId
    });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Server error" });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ "profile.email": email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        email: user.profile.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: user.userId,
        email: user.profile.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// senior routes
app.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { mood, session } = req.body;

    const userExists = await User.findOne({ userId });
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    const validSessions = ['morning', 'afternoon', 'evening'];
    if (!session || !validSessions.includes(session)) {
      return res.status(400).json({ 
        error: `Invalid or missing session. Must be one of: ${validSessions.join(', ')}` 
      });
    }

    const validMoods = ['great', 'okay', 'not-well'];
    if (!mood || !validMoods.includes(mood)) {
      return res.status(400).json({ 
        error: `Invalid or missing mood. Must be one of: ${validMoods.join(', ')}` 
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const existingEngagement = await Engagement.findOne({ userId, date: today, session });
    if (existingEngagement) {
      return res.status(400).json({ error: `Already checked in for ${session} session today` });
    }
    

    const newEngagement = new Engagement({
      userId,
      date: today,
      session,
      mood,
      checkIn: true,
      tasksCompleted: [],
      totalScore: 0,
      lastActiveAt: new Date()
    });

    await newEngagement.save();

    res.status(201).json({
      message: `Check-in recorded successfully for ${session} session`,
      engagement: newEngagement
    });

  } catch (error) {
    console.error("Error during check-in:", error);

    if (error.code === 11000) {
      return res.status(400).json({ error: "Already checked in for this session today" });
    }

    res.status(500).json({ error: "Server error" });
  }
});

app.get('/total-points', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role !== 'senior') {
      return res.status(403).json({ error: 'Access denied. Only senior users can view total points.' });
    }

    const result = await Engagement.aggregate([
      { $match: { userId } },
      { $group: { _id: '$userId', totalPoints: { $sum: '$totalScore' } } }
    ]);

    const totalPoints = result.length > 0 ? result[0].totalPoints : 0;

    res.status(200).json({
      message: 'Total engagement points retrieved successfully',
      userId,
      totalPoints
    });
  } catch (error) {
    console.error('Error calculating total points:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/add-relation', authenticateToken, async (req, res, next) => {
  try {
    const seniorId = req.user.userId;
    const { username, relation } = req.body;

    if (!username || !relation) {
      return res.status(400).json({ error: "username and relation are required" });
    }

    const seniorUser = await User.findOne({ userId: seniorId });
    if (!seniorUser) {
      return res.status(404).json({ error: "Senior user not found" });
    }

    if (seniorUser.role !== "senior") {
      return res.status(403).json({ error: "Only senior users can add family members" });
    }

    const familyUser = await User.findOne({ username });
    if (!familyUser) {
      return res.status(404).json({ error: "Family member account not found" });
    }

    const existingRel = await Relationship.findOne({ seniorId, linkAccId: familyUser.userId });
    if (existingRel) {
      return res.status(400).json({ error: "Family member already linked" });
    }

    const newRel = new Relationship({
      seniorId,
      linkAccId: familyUser.userId,
      relation
    });

    await newRel.save();

    res.status(200).json({
      message: `Family member '${username}' linked successfully`,
      relationship: newRel
    });

  } catch (error) {
    next(error);
  }
});

app.delete('/remove-relation', authenticateToken, async (req, res, next) => {
  try {
    const requesterId = req.user.userId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }

    const requester = await User.findOne({ userId: requesterId });
    if (!requester) {
      return res.status(404).json({ error: "Requester not found" });
    }

    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found" });
    }

    if (requester.role === 'senior') {
      const deletedRel = await Relationship.findOneAndDelete({
        seniorId: requesterId,
        linkAccId: targetUser.userId
      });

      if (!deletedRel) {
        return res.status(404).json({ error: "No relationship found to remove" });
      }

      return res.status(200).json({
        message: `Family member '${username}' unlinked successfully`
      });
    }

    if (requester.role === 'admin') {
      const deletedRel = await Relationship.findOneAndDelete({
        $or: [
          { seniorId: targetUser.userId },
          { linkAccId: targetUser.userId } 
        ]
      });

      if (!deletedRel) {
        return res.status(404).json({ error: "No relationship found to remove" });
      }

      return res.status(200).json({
        message: `Relationship involving '${username}' removed successfully by admin`
      });
    }

    return res.status(403).json({ error: "Only seniors or admins can remove relationships" });
  } catch (error) {
    console.error("Error removing relation:", error);
    next(error);
  }
});
// view relations for senior, admin, or linked caregivers
app.get('/relations/:userId', authenticateToken, async (req, res, next) => {
  try {
    const requester = req.user;
    const { userId } = req.params;

    const isSelf = requester.userId === userId;
    const isAdmin = requester.role === 'admin';
    let isLinkedCaregiver = false;

    if (!isSelf && !isAdmin) {
      isLinkedCaregiver = await Relationship.exists({
        seniorId: userId,
        linkAccId: requester.userId
      });
      if (!isLinkedCaregiver) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    if (!isSelf && !isAdmin && !isLinkedCaregiver) {
      return res.status(403).json({ error: "Access denied" });
    }

    const relationships = await Relationship.find({ seniorId: userId }).lean();

    const detailedRelations = await Promise.all(
      relationships.map(async (rel) => {
        const familyUser = await User.findOne(
          { userId: rel.linkAccId },
          '-passwordHash'
        ).lean();
        return {
          relation: rel.relation,
          familyUser
        };
      })
    );

    res.status(200).json({
      seniorId: userId,
      relations: detailedRelations
    });
  } catch (error) {
    console.error("Error fetching relations:", error);
    next(error);
  }
});

// caregiver-specific routes
app.get('/caregiver/seniors', authenticateToken, async (req, res, next) => {
  try {
    const caregiverId = req.user.userId;
    const allowedRoles = ['family'];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Only caregivers can access linked seniors.' });
    }

    const relationships = await Relationship.find({ linkAccId: caregiverId }).lean();

    if (!relationships.length) {
      return res.status(200).json({
        caregiverId,
        seniors: []
      });
    }

    const seniorIds = relationships.map(rel => rel.seniorId);
    const seniors = await User.find(
      { userId: { $in: seniorIds } },
      '-passwordHash'
    ).lean();

    const seniorsById = seniors.reduce((acc, senior) => {
      acc[senior.userId] = senior;
      return acc;
    }, {});

    const result = relationships
      .filter(rel => seniorsById[rel.seniorId])
      .map(rel => ({
        seniorId: rel.seniorId,
        relation: rel.relation,
        senior: seniorsById[rel.seniorId]
      }));

    res.status(200).json({
      caregiverId,
      seniors: result
    });
  } catch (error) {
    console.error('Error fetching caregiver seniors:', error);
    next(error);
  }
});

app.get('/caregiver/seniors/:seniorId/summary', authenticateToken, async (req, res, next) => {
  try {
    const caregiverId = req.user.userId;
    const allowedRoles = ['family'];
    const { seniorId } = req.params;

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Only caregivers can access senior summaries.' });
    }

    const relationshipExists = await Relationship.exists({
      seniorId,
      linkAccId: caregiverId
    });

    if (!relationshipExists) {
      return res.status(403).json({ error: 'Access denied. Senior is not linked to caregiver.' });
    }

    const today = new Date().toISOString().split('T')[0];

    const todayEngagements = await Engagement.find(
      { userId: seniorId, date: today }
    ).lean();

    const totalPointsAggregation = await Engagement.aggregate([
      { $match: { userId: seniorId } },
      { $group: { _id: '$userId', totalPoints: { $sum: '$totalScore' } } }
    ]);

    const totalPoints = totalPointsAggregation.length
      ? totalPointsAggregation[0].totalPoints
      : 0;

    const lastEngagement = await Engagement.findOne(
      { userId: seniorId },
      {},
      { sort: { lastActiveAt: -1 } }
    ).lean();

    res.status(200).json({
      seniorId,
      today,
      totalPoints,
      todayEngagements,
      lastActiveAt: lastEngagement?.lastActiveAt || null
    });
  } catch (error) {
    console.error('Error fetching caregiver senior summary:', error);
    next(error);
  }
});

app.post('/add-task', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role !== 'senior') {
      return res.status(403).json({ error: 'Only senior users can add tasks' });
    }

    const { type, points, date, session } = req.body;

    if (!type || typeof points !== 'number') {
      return res.status(400).json({ error: 'Task type and numeric points are required' });
    }

    const validSessions = ['morning', 'afternoon', 'evening'];
    if (!session || !validSessions.includes(session)) {
      return res.status(400).json({ 
        error: `Invalid or missing session. Must be one of: ${validSessions.join(', ')}` 
      });
    }

    const engagementDate = date || new Date().toISOString().split('T')[0];

    let engagement = await Engagement.findOne({ userId, date: engagementDate, session });

    if (!engagement) {
      engagement = new Engagement({
        userId,
        date: engagementDate,
        session,
        checkIn: false,
        tasksCompleted: [],
        totalScore: 0,
        lastActiveAt: new Date()
      });
    }

    engagement.tasksCompleted.push({ type, points });
    engagement.totalScore = engagement.tasksCompleted.reduce((acc, task) => acc + task.points, 0);
    engagement.lastActiveAt = new Date();

    await engagement.save();

    res.status(200).json({
      message: `Task added successfully for ${session} session on ${engagementDate}`,
      engagement
    });

  } catch (error) {
    console.error('Error adding task:', error);

    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate engagement entry for this session and date' });
    }

    res.status(500).json({ error: 'Server error' });
  }
});

// Get today's engagements for a user
app.get('/engagements/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    const engagements = await Engagement.find({ userId, date: today });

    res.status(200).json({
      success: true,
      date: today,
      engagements: engagements
    });
  } catch (error) {
    console.error('Error fetching today\'s engagements:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

//ADMIN
app.get('/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view all users' });
    }

    const users = await User.find({}, '-passwordHash');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.get('/users/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findOne({ userId }, '-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/admin/stats/today', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view stats' });
    }
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const lastWeekStr = lastWeek.toISOString().split('T')[0];

    const totalSeniors = await User.countDocuments({ role: 'senior' });
    const totalSeniorsLastWeek = await User.countDocuments({
      role: 'senior',
      createdAt: { $lte: lastWeek }
    });

    const activeTodayIds = await Engagement.distinct('userId', { date: todayStr });
    const activeLastWeekIds = await Engagement.distinct('userId', { date: lastWeekStr });
    const totalActiveSeniors = activeTodayIds.length;
    const totalActiveLastWeek = activeLastWeekIds.length;

    const totalCheckinsToday = await Engagement.countDocuments({ date: todayStr, checkIn: true });
    const totalCheckinsLastWeek = await Engagement.countDocuments({ date: lastWeekStr, checkIn: true });

    const calcPercentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const totalSeniorsChange = calcPercentChange(totalSeniors, totalSeniorsLastWeek);
    const totalActiveSeniorsChange = calcPercentChange(totalActiveSeniors, totalActiveLastWeek);
    const totalCheckinsChange = calcPercentChange(totalCheckinsToday, totalCheckinsLastWeek);
    // currently gives 6 stats, 1. Total no. of seniors, 2. No. of seniors active tdy, 3. Total checkins tdy, and the differences between lastwk and this wk in %
    res.status(200).json({
      date: todayStr,
      totalSeniors,
      totalSeniorsChange,
      totalActiveSeniors,
      totalActiveSeniorsChange,
      totalCheckinsToday,
      totalCheckinsChange
    });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/admin/stats/weekly-engagement', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view engagement trends' });
    }

    const today = new Date();
    const trendData = [];

    // last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const activeUsers = await Engagement.distinct('userId', { date: dateStr });
      const activeCount = activeUsers.length;
      const checkinsCount = await Engagement.countDocuments({ date: dateStr, checkIn: true });

      trendData.push({
        date: dateStr,
        activeUsers: activeCount,
        checkins: checkinsCount
      });
    }

    res.status(200).json({
      message: 'Weekly engagement trend fetched successfully',
      trendData
    });

  } catch (error) {
    console.error('Error fetching weekly engagement:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/admin/stats/usercount', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view user statistics' });
    }

    const roleCounts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    const stats = {
      totalUsers: 0,
      seniors: 0,
      family: 0,
      admins: 0
    };

    roleCounts.forEach(r => {
      stats.totalUsers += r.count;
      if (r._id === 'senior') stats.seniors = r.count;
      if (r._id === 'family') stats.family = r.count;
      if (r._id === 'admin') stats.admins = r.count;
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching user counts by role:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.use((req, res) => {
  res.status(404).send('404 - Page not found');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
module.exports = {
  User,
  Relationship,
  Engagement
};