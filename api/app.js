const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
const mqtt = require('mqtt');
const { User, Relationship, Engagement, Invitation, Activity, Reminder } = require('./models');

const app = express();
const port = 8080;

const JWT_SECRET = 'secret1234@';

// IMPORTANT: Proxy middleware MUST come BEFORE express.json() to avoid body parsing conflicts
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

// Proxy /notification requests to notification-service (FCM config, token save, dashboard)
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4002';
app.use('/notification', createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/notification': '', // Remove /notification prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.path} -> ${NOTIFICATION_SERVICE_URL}${req.path}`);
  },
  onError: (err, req, res) => {
    console.error('[Proxy Error]', err);
    res.status(500).json({ error: 'Notification service unavailable' });
  }
}));

// Apply express.json() AFTER proxy middleware so body isn't consumed before proxying
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/senior_care';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB!'))
.catch(err => console.error('MongoDB connection error:', err));

// Connect to MQTT Broker
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://hivemq:1883';
const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  clientId: `api-gateway-${uuidv4()}`,
  clean: true,
  reconnectPeriod: 1000,
});

mqttClient.on('connect', () => {
  console.log('✅ API Gateway connected to MQTT Broker');
});

mqttClient.on('error', (error) => {
  console.error('❌ MQTT connection error:', error);
});

// Helper function to publish events to MQTT
function publishEvent(eventType, eventData) {
  const event = {
    type: eventType,
    ...eventData,
    timestamp: new Date().toISOString()
  };

  // Set default target if not provided
  if (!event.target && !event.targets) {
    event.target = ['dashboard', 'mobile'];
  }

  mqttClient.publish('notification/events', JSON.stringify(event), { qos: 1 }, (err) => {
    if (err) {
      console.error(`❌ Failed to publish ${eventType} event:`, err);
    } else {
      console.log(`📤 Published ${eventType} event to MQTT:`, { type: eventType, userId: event.userId, targets: event.target || event.targets });
    }
  });
}

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

// Hybrid authentication: supports both JWT tokens and service-to-service auth
function authenticateHybrid(req, res, next) {
  // Check for service-to-service authentication first
  const serviceAuth = req.headers['x-service-auth'];
  const SERVICE_AUTH_TOKEN = process.env.SERVICE_AUTH_TOKEN || 'games-service-secret';

  if (serviceAuth === SERVICE_AUTH_TOKEN) {
    // Service-to-service call - extract userId from request body or query
    const userId = req.body.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId required for service calls' });
    }

    // Create a mock user object for service calls
    req.user = {
      userId: userId,
      role: 'senior', // Services can only perform actions on behalf of seniors
      serviceAuth: true
    };

    console.log(`[SERVICE-AUTH] Authenticated service call for user ${userId}`);
    return next();
  }

  // Fall back to regular JWT authentication
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token or service auth provided.' });
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
// Admin-only endpoint for creating users (including admins)
app.post('/register', authenticateToken, async (req, res) => {
  try {
    // Only admins can use this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can create users. Please use the public signup for senior/family accounts.' });
    }

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

    const validRoles = ['senior', 'family', 'caregiver', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'senior', 'family', 'caregiver', or 'admin'" });
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

    // Update last active time
    user.lastActiveAt = new Date();
    await user.save();

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

    // Publish login event for real-time updates (especially for seniors)
    if (user.role === 'senior') {
      // Publish event to senior's dashboard
      publishEvent('login', {
        userId: user.userId,
        username: user.username,
        name: user.profile?.name || user.username,
        role: user.role,
        title: 'Senior Login',
        body: `${user.profile?.name || user.username} has logged in`
      });

      // Notify caregivers that senior has logged in
      try {
        const relationships = await Relationship.find({ seniorId: user.userId }).lean();
        const caregiverIds = relationships.map(r => r.linkAccId).filter(Boolean);

        if (caregiverIds.length > 0) {
          for (const caregiverId of caregiverIds) {
            publishEvent('senior_login_notification', {
              userId: caregiverId,
              seniorId: user.userId,
              seniorName: user.profile?.name || user.username,
              timestamp: new Date().toISOString(),
              title: `${user.profile?.name || user.username} Logged In`,
              body: `${user.profile?.name || user.username} has successfully logged in at ${new Date().toLocaleTimeString()}`,
              target: ['mobile', 'dashboard']
            });
          }
          console.log(`[LOGIN] Notified ${caregiverIds.length} caregiver(s) about ${user.profile?.name || user.username}'s login`);
        }
      } catch (err) {
        console.error('[LOGIN] Error notifying caregivers:', err);
      }
    }

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

// Get current user's profile
app.get('/user/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findOne({ userId }, '-passwordHash').lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      userId: user.userId,
      username: user.username,
      role: user.role,
      profile: user.profile,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Signup endpoint (alias to register)
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role, profile } = req.body;
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

    // Public signup only allows senior, family, and caregiver roles
    const validRoles = ['senior', 'family', 'caregiver'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Public signup only allows 'senior', 'family', or 'caregiver' accounts. Admin accounts must be created by administrators." });
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
      success: true,
      message: `User ${username} created successfully`,
      userId
    });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// senior routes
app.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { mood, session } = req.body;

    const userExists = await User.findOne({ userId });
    if (!userExists) return res.status(404).json({ error: "User not found" });

    const validSessions = ['morning', 'afternoon', 'evening'];
    if (!session || !validSessions.includes(session)) {
      return res.status(400).json({ error: `Invalid or missing session. Must be one of: ${validSessions.join(', ')}` });
    }

    const validMoods = ['great', 'okay', 'not-well'];
    if (!mood || !validMoods.includes(mood)) {
      return res.status(400).json({ error: `Invalid or missing mood. Must be one of: ${validMoods.join(', ')}` });
    }

    const today = new Date().toISOString().split('T')[0];
    const existingEngagement = await Engagement.findOne({ userId, date: today, session });
    if (existingEngagement) {
      return res.status(400).json({ error: `Already checked in for ${session} session today` });
    }

    const calculateStreak = async (userId) => {
      const engagements = await Engagement.find({ userId, checkIn: true })
        .sort({ date: -1 })
        .select('date');
    
      if (engagements.length === 0) return 1;
    
      const formatDate = d => new Date(d).toISOString().split('T')[0];
      const uniqueDates = [...new Set(engagements.map(e => formatDate(e.date)))];
    
      const today = formatDate(new Date());
      const mostRecent = uniqueDates[0];
      const diffToday = Math.floor((new Date(today) - new Date(mostRecent)) / (1000 * 60 * 60 * 24));
    
      if (diffToday > 1) return 1;
    
      let streak = 1;
      let prevDate = mostRecent;
    
      for (let i = 1; i < uniqueDates.length; i++) {
        const current = new Date(prevDate);
        const next = new Date(uniqueDates[i]);
        const diff = (current - next) / (1000 * 60 * 60 * 24);
    
        if (diff === 1) {
          streak++;
        } else {
          break;
        }
        prevDate = uniqueDates[i];
      }
    
      if (mostRecent === today) {
        return streak;
      }
    
      if (diffToday === 1) {
        return streak + 1;
      }
    
      return 1;
    };
    

    const streak = await calculateStreak(userId);

    // Award points for check-in
    const checkInPoints = 5;
    const tasksCompleted = [{ type: 'checkin', points: checkInPoints }];
    let totalScore = checkInPoints;

    const newEngagement = new Engagement({
      userId,
      date: today,
      session,
      mood,
      checkIn: true,
      tasksCompleted,
      totalScore,
      lastActiveAt: new Date(),
      streak
    });

    await newEngagement.save();

    console.log(`[CHECK-IN] User ${userId} checked in (${session}). Points: ${checkInPoints}, Streak: ${streak}`);

    // Publish MQTT event for real-time dashboard updates
    publishEvent('checkin', {
      userId,
      session,
      mood,
      points: checkInPoints,
      streak,
      title: 'Check-in Completed',
      body: `${session.charAt(0).toUpperCase() + session.slice(1)} check-in recorded (${mood})`
    });

    // Send urgent alert to caregivers if senior is not feeling well
    if (mood === 'not-well') {
      try {
        const seniorUser = await User.findOne({ userId }).select('profile username').lean();
        const seniorName = seniorUser?.profile?.name || seniorUser?.username || userId;

        const relationships = await Relationship.find({ seniorId: userId }).lean();
        const caregiverIds = relationships.map(r => r.linkAccId).filter(Boolean);

        if (caregiverIds.length > 0) {
          for (const caregiverId of caregiverIds) {
            publishEvent('urgent_wellbeing_alert', {
              userId: caregiverId,
              seniorId: userId,
              seniorName,
              mood,
              session,
              timestamp: new Date().toISOString(),
              title: `⚠️ ${seniorName} Needs Attention`,
              body: `${seniorName} checked in feeling "not well" during ${session} session. Please check on them immediately.`,
              target: ['mobile', 'dashboard'],
              priority: 'urgent'
            });
          }
          console.log(`[URGENT] Alerted ${caregiverIds.length} caregiver(s) - ${seniorName} is not feeling well`);
        } else {
          console.warn(`[URGENT] No caregivers found for senior ${userId} who is not feeling well`);
        }
      } catch (err) {
        console.error('[CHECK-IN] Error sending urgent wellbeing alert:', err);
      }
    }

    res.status(201).json({
      message: `Check-in recorded successfully for ${session} session`,
      engagement: newEngagement
    });

  } catch (error) {
    console.error("Error during check-in:", error);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/total-points', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;

    // Validation: Check role
    if (role !== 'senior') {
      console.log(`[VALIDATION] Access denied for user ${userId} with role ${role}`);
      return res.status(403).json({ error: 'Access denied. Only senior users can view total points.' });
    }

    // Validation: Check user exists
    const userExists = await User.findOne({ userId });
    if (!userExists) {
      console.log(`[VALIDATION] User ${userId} not found in database`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[TOTAL-POINTS] Calculating points for user ${userId}`);

    const result = await Engagement.aggregate([
      { $match: { userId } },
      { $group: { _id: '$userId', totalPoints: { $sum: '$totalScore' } } }
    ]);

    const totalPoints = result.length > 0 ? result[0].totalPoints : 0;

    const xpForLevel = (L) => {
      if (L <= 0) return 0;
      return Math.floor((50 * Math.pow(L, 2) + 100 * Math.pow(1.1, L)) / 4);
    };

    let level = 0;
    while (totalPoints >= xpForLevel(level + 1)) {
      level++;
    }

    const currentXP = totalPoints - xpForLevel(level);
    const nextLevelXP = xpForLevel(level + 1) - xpForLevel(level);
    const progressPercent =
      nextLevelXP > 0
        ? Math.min(100, ((currentXP / nextLevelXP) * 100).toFixed(2))
        : 0;

    const latestCheckin = await Engagement.findOne({ userId, checkIn: true })
      .sort({ date: -1, lastActiveAt: -1 })
      .select('date session mood streak');

    const latestStreak = latestCheckin ? latestCheckin.streak || 0 : 0;

    console.log(`[TOTAL-POINTS] User ${userId}: ${totalPoints} points, Level ${level}, ${latestStreak}-day streak`);

    res.status(200).json({
      message: 'Total points, level, and latest streak retrieved successfully',
      userId,
      totalPoints,
      level,
      progress: {
        percent: Number(progressPercent),
        currentXP,
        xpToNextLevel: Math.max(0, nextLevelXP - currentXP)
      },
      latestStreak
    });
  } catch (error) {
    console.error('[ERROR] Error calculating total points and streak:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/add-relation', authenticateToken, async (req, res, next) => {
  try {
    const requesterId = req.user.userId;
    const { username, relation } = req.body;

    if (!username || !relation) {
      return res.status(400).json({ error: "username and relation are required" });
    }

    const requester = await User.findOne({ userId: requesterId });
    if (!requester) {
      return res.status(404).json({ error: "Requester not found" });
    }

    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found" });
    }

    const existingRel = await Relationship.findOne({
      $or: [
        { seniorId: requesterId, linkAccId: targetUser.userId },
        { seniorId: targetUser.userId, linkAccId: requesterId }
      ]
    });

    if (existingRel) {
      return res.status(400).json({ error: "Relationship already exists" });
    }

    let seniorId, linkAccId;

    const isCaregiver = (role) => role === "family" || role === "caregiver";

    if (requester.role === "senior" && isCaregiver(targetUser.role)) {
      seniorId = requesterId;
      linkAccId = targetUser.userId;
    } else if (isCaregiver(requester.role) && targetUser.role === "senior") {
      seniorId = targetUser.userId;
      linkAccId = requesterId;
    } else {
      return res.status(400).json({
        error: "Invalid relationship. Family/Caregivers can only link with seniors and vice versa."
      });
    }

    const newRel = new Relationship({
      seniorId,
      linkAccId,
      relation
    });

    await newRel.save();

    res.status(200).json({
      message: `Relationship established successfully between '${requester.username}' and '${targetUser.username}'`,
      relationship: newRel
    });

  } catch (error) {
    console.error("Error adding relation:", error);
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
    const allowedRoles = ['family', 'caregiver'];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Only caregivers and family members can access linked seniors.' });
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
    const allowedRoles = ['family', 'caregiver'];
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

app.post('/add-task', authenticateHybrid, async (req, res) => {
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

    // Calculate today's total points across all sessions (daily point cap check)
    const DAILY_POINT_CAP = 100;
    const todayEngagements = await Engagement.find({ userId, date: engagementDate });
    const todayTotalPoints = todayEngagements.reduce((sum, eng) => sum + eng.totalScore, 0);

    console.log(`[ADD-TASK] User ${userId}: Current daily total: ${todayTotalPoints}/${DAILY_POINT_CAP} points`);

    // Calculate how many points can still be added today
    const remainingDailyPoints = Math.max(0, DAILY_POINT_CAP - todayTotalPoints);

    if (remainingDailyPoints === 0) {
      console.log(`[DAILY-CAP] User ${userId} has reached daily point cap (${DAILY_POINT_CAP} points)`);
      return res.status(400).json({
        error: 'Daily point cap reached',
        message: `You've earned the maximum ${DAILY_POINT_CAP} points for today. Great job! Come back tomorrow for more.`,
        dailyTotal: todayTotalPoints,
        dailyCap: DAILY_POINT_CAP
      });
    }

    // Cap the points to the remaining daily allowance
    let cappedPoints = points;
    let pointsCapped = false;

    if (points > remainingDailyPoints) {
      cappedPoints = remainingDailyPoints;
      pointsCapped = true;
      console.log(`[DAILY-CAP] Points capped: ${points} → ${cappedPoints} (remaining: ${remainingDailyPoints})`);
    }

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

    engagement.tasksCompleted.push({ type, points: cappedPoints });
    engagement.totalScore = engagement.tasksCompleted.reduce((acc, task) => acc + task.points, 0);
    engagement.lastActiveAt = new Date();

    await engagement.save();

    const newDailyTotal = todayTotalPoints + cappedPoints;
    console.log(`[ADD-TASK] Task "${type}" added: ${cappedPoints} points. Daily total: ${newDailyTotal}/${DAILY_POINT_CAP}`);

    // Publish MQTT event for real-time dashboard updates
    const gameNames = {
      'trivia': 'Brain Boost Trivia',
      'memory': 'Memory Match',
      'stretch': 'Morning Stretch',
      'recipe': 'Share a Recipe',
      'tower': 'Stack Tower',
      'ai_chat': 'AI Companion Chat'
    };

    publishEvent('game_completed', {
      userId,
      gameType: type,
      gameName: gameNames[type] || type,
      points: cappedPoints,
      session,
      dailyTotal: newDailyTotal,
      title: 'Activity Completed!',
      body: `Earned ${cappedPoints} points from ${gameNames[type] || type}`
    });

    const response = {
      message: `Task added successfully for ${session} session on ${engagementDate}`,
      engagement,
      dailyProgress: {
        todayTotal: newDailyTotal,
        dailyCap: DAILY_POINT_CAP,
        remaining: DAILY_POINT_CAP - newDailyTotal
      }
    };

    if (pointsCapped) {
      response.warning = `Points awarded were capped to ${cappedPoints} (original: ${points}) to stay within daily limit.`;
    }

    res.status(200).json(response);

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

// Invitations
app.post('/invitations/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; //invitation id
    const { status } = req.body;
    const { userId, role } = req.user;

    if (role !== 'senior') {
      return res.status(403).json({ error: 'Only senior users can respond to invitations' });
    }

    const validStatuses = ['accepted', 'declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const invitation = await Invitation.findOne({ invitationId: id });
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.seniorId !== userId) {
      return res.status(403).json({
        error: 'You are not authorized to respond to this invitation'
      });
    }

    invitation.status = status;
    invitation.respondedAt = new Date();

    await invitation.save();

    res.status(200).json({
      message: `Invitation ${status} successfully`,
      invitation: {
        invitationId: invitation.invitationId,
        title: invitation.title,
        description: invitation.description,
        dateTime: invitation.dateTime,
        status: invitation.status,
        respondedAt: invitation.respondedAt
      }
    });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/invitations', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role !== 'senior') {
      return res.status(403).json({ error: 'Only senior users can view invitations' });
    }

    const invitations = await Invitation.find({ seniorId: userId })
      .sort({ dateTime: 1 }) // upcoming first
      .lean();

    if (invitations.length === 0) {
      return res.status(200).json({
        message: 'No invitations found',
        invitations: []
      });
    }

    const formattedInvitations = invitations.map(inv => ({
      invitationId: inv.invitationId,
      title: inv.title,
      description: inv.description,
      dateTime: inv.dateTime,
      status: inv.status,
      familyId: inv.familyId || null,
      respondedAt: inv.respondedAt || null
    }));

    res.status(200).json({
      message: 'Invitations retrieved successfully',
      count: invitations.length,
      invitations: formattedInvitations
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/invitations', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role !== 'family') {
      return res.status(403).json({ error: 'Only family members can create invitations' });
    }

    const { seniorUsername, title, description, dateTime } = req.body;

    if (!seniorUsername || !title || !dateTime) {
      return res.status(400).json({
        error: "Missing required fields: seniorUsername, title, and dateTime are required"
      });
    }

    const seniorUser = await User.findOne({ username: seniorUsername, role: 'senior' });
    if (!seniorUser) {
      return res.status(404).json({ error: 'Senior not found' });
    }

    const relationship = await Relationship.findOne({
      seniorId: seniorUser.userId,
      linkAccId: userId
    });

    if (!relationship) {
      return res.status(403).json({ error: 'You are not linked to this senior' });
    }

    const eventDate = new Date(dateTime);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ error: 'Invalid dateTime format' });
    }
    if (eventDate < new Date()) {
      return res.status(400).json({ error: 'Invitation date must be in the future' });
    }

    const { v4: uuidv4 } = require('uuid');
    const newInvitation = new Invitation({
      invitationId: uuidv4(),
      seniorId: seniorUser.userId,
      familyId: userId,
      title,
      description: description || '',
      dateTime: eventDate,
      status: 'pending'
    });

    await newInvitation.save();

    res.status(201).json({
      message: `Invitation created successfully for ${seniorUsername}`,
      invitation: {
        invitationId: newInvitation.invitationId,
        seniorId: seniorUser.userId,
        familyId: userId,
        title: newInvitation.title,
        description: newInvitation.description,
        dateTime: newInvitation.dateTime,
        status: newInvitation.status
      }
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ACTIVITIES ENDPOINTS
// Get activities for a caregiver
app.get('/caregiver/activities', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.userId;
    
    if (req.user.role !== 'family') {
      return res.status(403).json({ error: 'Only caregivers can access activities' });
    }

    const activities = await Activity.find({ familyId }).sort({ date: 1, time: 1 }).lean();
    
    // Enrich with senior details
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const senior = await User.findOne({ userId: activity.seniorId }, '-passwordHash').lean();
        return {
          id: activity.activityId,
          activityId: activity.activityId,
          title: activity.title,
          senior: senior?.profile?.name || senior?.username || 'Unknown',
          seniorId: activity.seniorId,
          seniorInitials: senior?.profile?.name ? senior.profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'UK',
          date: activity.date,
          time: activity.time,
          type: activity.type,
          description: activity.description,
          status: activity.status,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt
        };
      })
    );

    res.status(200).json({
      activities: enrichedActivities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create activity
app.post('/caregiver/activities', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.userId;
    
    if (req.user.role !== 'family') {
      return res.status(403).json({ error: 'Only caregivers can create activities' });
    }

    const { seniorId, title, description, date, time, type } = req.body;

    if (!seniorId || !title || !date || !time) {
      return res.status(400).json({ error: 'seniorId, title, date, and time are required' });
    }

    // Verify the senior is linked to this caregiver
    const relationship = await Relationship.findOne({ seniorId, linkAccId: familyId });
    if (!relationship) {
      return res.status(403).json({ error: 'Senior is not linked to this caregiver' });
    }

    const activityId = uuidv4();
    const newActivity = new Activity({
      activityId,
      seniorId,
      familyId,
      title,
      description: description || '',
      date,
      time,
      type: type || 'visit',
      status: 'pending'
    });

    await newActivity.save();

    // Get senior details for response
    const senior = await User.findOne({ userId: seniorId }, '-passwordHash').lean();

    res.status(201).json({
      message: 'Activity created successfully',
      activity: {
        id: activityId,
        activityId,
        title,
        senior: senior?.profile?.name || senior?.username || 'Unknown',
        seniorId,
        seniorInitials: senior?.profile?.name ? senior.profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'UK',
        date,
        time,
        type: newActivity.type,
        description: newActivity.description,
        status: newActivity.status
      }
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update activity
app.put('/caregiver/activities/:activityId', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.userId;
    const { activityId } = req.params;
    
    if (req.user.role !== 'family') {
      return res.status(403).json({ error: 'Only caregivers can update activities' });
    }

    const activity = await Activity.findOne({ activityId, familyId });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const { title, description, date, time, type, status } = req.body;
    
    if (title) activity.title = title;
    if (description !== undefined) activity.description = description;
    if (date) activity.date = date;
    if (time) activity.time = time;
    if (type) activity.type = type;
    if (status) activity.status = status;

    await activity.save();

    res.status(200).json({
      message: 'Activity updated successfully',
      activity
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete activity
app.delete('/caregiver/activities/:activityId', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.userId;
    const { activityId } = req.params;
    
    if (req.user.role !== 'family') {
      return res.status(403).json({ error: 'Only caregivers can delete activities' });
    }

    const activity = await Activity.findOneAndDelete({ activityId, familyId });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.status(200).json({
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// SENIOR ACTIVITIES ENDPOINTS
// Get activities for a senior
app.get('/senior/activities', authenticateToken, async (req, res) => {
  try {
    const seniorId = req.user.userId;
    
    if (req.user.role !== 'senior') {
      return res.status(403).json({ error: 'Only seniors can access their activities' });
    }

    const activities = await Activity.find({ seniorId }).sort({ date: 1, time: 1 }).lean();
    
    // Enrich with caregiver details
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const caregiver = await User.findOne({ userId: activity.familyId }, '-passwordHash').lean();
        return {
          id: activity.activityId,
          activityId: activity.activityId,
          title: activity.title,
          caregiver: caregiver?.profile?.name || caregiver?.username || 'Caregiver',
          caregiverId: activity.familyId,
          date: activity.date,
          time: activity.time,
          type: activity.type,
          description: activity.description,
          status: activity.status,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt
        };
      })
    );

    res.status(200).json({
      activities: enrichedActivities
    });
  } catch (error) {
    console.error('Error fetching senior activities:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update activity status (for senior to accept/reject)
app.patch('/senior/activities/:activityId/status', authenticateToken, async (req, res) => {
  try {
    const seniorId = req.user.userId;
    const { activityId } = req.params;
    const { status } = req.body;
    
    if (req.user.role !== 'senior') {
      return res.status(403).json({ error: 'Only seniors can update activity status' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "accepted" or "rejected"' });
    }

    const activity = await Activity.findOne({ activityId, seniorId });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    activity.status = status;
    await activity.save();

    res.status(200).json({
      message: 'Activity status updated successfully',
      activity: {
        id: activity.activityId,
        status: activity.status
      }
    });
  } catch (error) {
    console.error('Error updating activity status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get caregivers/family linked to a senior
app.get('/senior/caregivers', authenticateToken, async (req, res) => {
  try {
    const seniorId = req.user.userId;

    if (req.user.role !== 'senior') {
      return res.status(403).json({ error: 'Only seniors can access this endpoint' });
    }

    const relationships = await Relationship.find({ seniorId }).lean();

    if (!relationships.length) {
      return res.status(200).json({ seniorId, caregivers: [] });
    }

    const caregiverIds = relationships.map(rel => rel.linkAccId);
    const caregivers = await User.find(
      { userId: { $in: caregiverIds } },
      '-passwordHash'
    ).lean();

    const caregiversById = caregivers.reduce((acc, caregiver) => {
      acc[caregiver.userId] = caregiver;
      return acc;
    }, {});

    const result = relationships
      .filter(rel => caregiversById[rel.linkAccId])
      .map(rel => ({
        caregiverId: rel.linkAccId,
        relation: rel.relation,
        role: caregiversById[rel.linkAccId].role,
        name: caregiversById[rel.linkAccId].profile?.name || caregiversById[rel.linkAccId].username,
        email: caregiversById[rel.linkAccId].profile?.email,
        contact: caregiversById[rel.linkAccId].profile?.contact
      }));

    res.status(200).json({ seniorId, caregivers: result });
  } catch (error) {
    console.error('Error fetching senior caregivers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// REMINDERS ENDPOINTS
// Get reminders for a caregiver
app.get('/caregiver/reminders', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.userId;
    
    if (req.user.role !== 'family') {
      return res.status(403).json({ error: 'Only caregivers can access reminders' });
    }

    const reminders = await Reminder.find({ familyId }).sort({ time: 1 }).lean();
    
    // Enrich with senior details
    const enrichedReminders = await Promise.all(
      reminders.map(async (reminder) => {
        const senior = await User.findOne({ userId: reminder.seniorId }, '-passwordHash').lean();
        return {
          id: reminder.reminderId,
          reminderId: reminder.reminderId,
          title: reminder.title,
          senior: senior?.profile?.name || senior?.username || 'Unknown',
          seniorId: reminder.seniorId,
          seniorInitials: senior?.profile?.name ? senior.profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'UK',
          time: reminder.time,
          type: reminder.type,
          description: reminder.description,
          frequency: reminder.frequency,
          isActive: reminder.isActive,
          createdAt: reminder.createdAt,
          updatedAt: reminder.updatedAt
        };
      })
    );

    res.status(200).json({
      reminders: enrichedReminders
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test endpoint to send a test notification to a senior user
app.post('/test-notification', authenticateToken, async (req, res) => {
  try {
    const { seniorId } = req.body;

    if (!seniorId) {
      return res.status(400).json({ error: 'seniorId is required' });
    }

    // Publish a test notification event
    publishEvent('test_notification', {
      userId: seniorId,
      title: 'Test Notification',
      body: 'This is a test notification to verify push notifications are working!',
      target: ['mobile', 'dashboard']
    });

    res.status(200).json({
      message: 'Test notification sent',
      seniorId,
      note: 'Check the senior app and browser console for the notification'
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manual check for missed check-ins (for demo purposes)
app.post('/check-missed-checkins', authenticateToken, async (req, res) => {
  try {
    const caregiverId = req.user.userId;
    const caregiver = await User.findOne({ userId: caregiverId });

    if (!caregiver || (caregiver.role !== 'caregiver' && caregiver.role !== 'family')) {
      return res.status(403).json({ error: 'Only caregivers and family members can trigger this check' });
    }

    // Find all seniors linked to this caregiver
    const relationships = await Relationship.find({ linkAccId: caregiverId }).lean();
    const seniorIds = relationships.map(r => r.seniorId).filter(Boolean);

    if (seniorIds.length === 0) {
      return res.status(404).json({ error: 'No linked seniors found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const alerts = [];

    for (const seniorId of seniorIds) {
      // Check if senior has checked in today
      const todayEngagement = await Engagement.findOne({
        userId: seniorId,
        date: today,
        checkIn: true
      }).lean();

      if (!todayEngagement) {
        // Senior hasn't checked in today - send alert
        const seniorUser = await User.findOne({ userId: seniorId }).select('profile username').lean();
        const seniorName = seniorUser?.profile?.name || seniorUser?.username || seniorId;

        publishEvent('missed_checkin_alert', {
          userId: caregiverId,
          seniorId,
          seniorName,
          message: `${seniorName} has not checked in today`,
          title: `⚠️ Missed Check-in: ${seniorName}`,
          body: `${seniorName} has not checked in today. Please verify their wellbeing.`,
          target: ['mobile', 'dashboard'],
          priority: 'alert'
        });

        alerts.push({
          seniorId,
          seniorName,
          status: 'No check-in today'
        });

        console.log(`[MANUAL-CHECK] Alert sent for ${seniorName} - no check-in today`);
      }
    }

    res.status(200).json({
      message: 'Missed check-in check completed',
      seniorsChecked: seniorIds.length,
      alertsSent: alerts.length,
      alerts: alerts.length > 0 ? alerts : 'All seniors have checked in today!'
    });
  } catch (error) {
    console.error('Error checking missed check-ins:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create reminder
app.post('/caregiver/reminders', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.userId;
    
    if (req.user.role !== 'family' && req.user.role !== 'caregiver') {
      return res.status(403).json({ error: 'Only caregivers and family members can create reminders' });
    }

    const { seniorId, title, description, time, type, frequency } = req.body;

    if (!seniorId || !title || !time || !type) {
      return res.status(400).json({ error: 'seniorId, title, time, and type are required' });
    }

    // Verify the senior is linked to this caregiver
    const relationship = await Relationship.findOne({ seniorId, linkAccId: familyId });
    if (!relationship) {
      return res.status(403).json({ error: 'Senior is not linked to this caregiver' });
    }

    const reminderId = uuidv4();
    const newReminder = new Reminder({
      reminderId,
      seniorId,
      familyId,
      title,
      description: description || '',
      time,
      type,
      frequency: frequency || 'once',
      isActive: true
    });

    await newReminder.save();

    // Get senior details for response
    const senior = await User.findOne({ userId: seniorId }, '-passwordHash').lean();

    // Publish a push/mobile event so the senior gets notified
    try {
      publishEvent('reminder_created', {
        userId: seniorId,
        title: 'New Reminder',
        body: `${(req.user && req.user.username) || 'Your caregiver'} scheduled: ${title}`,
        reminder: {
          reminderId,
          title,
          description: newReminder.description || '',
          time,
          type,
          frequency: newReminder.frequency
        },
        target: ['mobile','dashboard']
      });
    } catch (e) {
      console.warn('Failed to publish reminder_created event', e && e.message ? e.message : e);
    }

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder: {
        id: reminderId,
        reminderId,
        title,
        senior: senior?.profile?.name || senior?.username || 'Unknown',
        seniorId,
        seniorInitials: senior?.profile?.name ? senior.profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'UK',
        time,
        type,
        description: newReminder.description,
        frequency: newReminder.frequency,
        isActive: newReminder.isActive
      }
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update reminder
app.put('/caregiver/reminders/:reminderId', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.userId;
    const { reminderId } = req.params;
    
    if (req.user.role !== 'family') {
      return res.status(403).json({ error: 'Only caregivers can update reminders' });
    }

    const reminder = await Reminder.findOne({ reminderId, familyId });
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const { title, description, time, type, frequency, isActive } = req.body;
    
    if (title) reminder.title = title;
    if (description !== undefined) reminder.description = description;
    if (time) reminder.time = time;
    if (type) reminder.type = type;
    if (frequency) reminder.frequency = frequency;
    if (isActive !== undefined) reminder.isActive = isActive;

    await reminder.save();

    res.status(200).json({
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete reminder
app.delete('/caregiver/reminders/:reminderId', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.userId;
    const { reminderId } = req.params;
    
    if (req.user.role !== 'family') {
      return res.status(403).json({ error: 'Only caregivers can delete reminders' });
    }

    const reminder = await Reminder.findOneAndDelete({ reminderId, familyId });
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.status(200).json({
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ANALYTICS ENDPOINTS
// Get engagement analytics for caregivers
app.get('/caregiver/analytics', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.userId;
    
    if (req.user.role !== 'family') {
      return res.status(403).json({ error: 'Only caregivers can access analytics' });
    }

    // Get all linked seniors
    const relationships = await Relationship.find({ linkAccId: familyId }).lean();
    const seniorIds = relationships.map(rel => rel.seniorId);

    if (seniorIds.length === 0) {
      return res.status(200).json({
        seniors: [],
        weeklyData: [],
        monthlyData: []
      });
    }

    // Calculate date ranges
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Get senior details
    const seniors = await User.find({ userId: { $in: seniorIds } }, '-passwordHash').lean();

    // Get engagements for all seniors
    const engagements = await Engagement.find({
      userId: { $in: seniorIds },
      date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] }
    }).lean();

    // Calculate weekly and monthly data
    const weeklyData = [];
    const monthlyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEngagements = engagements.filter(e => e.date === dateStr);
      weeklyData.push({
        week: dateStr,
        checkIns: dayEngagements.filter(e => e.checkIn).length,
        calls: 0, // Would need call tracking
        tasks: dayEngagements.reduce((sum, e) => sum + (e.tasksCompleted?.length || 0), 0)
      });
    }

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEngagements = engagements.filter(e => e.date === dateStr);
      monthlyData.push({
        month: dateStr,
        checkIns: dayEngagements.filter(e => e.checkIn).length,
        calls: 0,
        tasks: dayEngagements.reduce((sum, e) => sum + (e.tasksCompleted?.length || 0), 0)
      });
    }

    // Calculate per-senior stats
    const seniorsWithStats = await Promise.all(
      seniors.map(async (senior) => {
        const seniorEngagements = engagements.filter(e => e.userId === senior.userId);
        const totalPoints = seniorEngagements.reduce((sum, e) => sum + (e.totalScore || 0), 0);
        
        return {
          seniorId: senior.userId,
          name: senior.profile?.name || senior.username,
          initials: senior.profile?.name ? senior.profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'UK',
          engagement: Math.min(100, totalPoints),
          totalPoints,
          checkInsCount: seniorEngagements.filter(e => e.checkIn).length,
          tasksCount: seniorEngagements.reduce((sum, e) => sum + (e.tasksCompleted?.length || 0), 0)
        };
      })
    );

    res.status(200).json({
      seniors: seniorsWithStats,
      weeklyData,
      monthlyData
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error' });
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

app.get('/api/admin/stats/today', authenticateToken, async (req, res) => {
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

app.get('/api/admin/stats/weekly-engagement', authenticateToken, async (req, res) => {
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


app.get('/api/admin/stats/usercount', authenticateToken, async (req, res) => {
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

// GET /api/engagements/recent - Get recent activity/notifications
app.get('/api/engagements/recent', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Fetch recent notifications from notification service via internal API call
    try {
      const axios = require('axios');
      const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4002';
      const response = await axios.get(`${notificationServiceUrl}/dashboard/history`, {
        params: { limit, page: 1 },
        timeout: 3000
      });

      const notifications = response.data.items || [];
      res.status(200).json(notifications);
    } catch (notificationError) {
      console.error('Error fetching from notification service:', notificationError.message);
      // Return empty array if notification service is unavailable
      res.status(200).json([]);
    }
  } catch (error) {
    console.error('Error fetching recent engagements:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/admin/add-user', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create new users' });
    }

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

    const validRoles = ['senior', 'family', 'caregiver', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'senior', 'family', 'caregiver', or 'admin'" });
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
        name: profile.name,
        age: profile.age,
        email: profile.email,
        contact: profile.contact
      },
    });

    await newUser.save();

    res.status(201).json({
      message: `User '${username}' created successfully by admin`,
      user: {
        userId,
        username,
        role,
        profile: newUser.profile
      }
    });
  } catch (error) {
    console.error("Error creating user by admin:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put('/admin/update-user/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update users' });
    }

    const { userId } = req.params;
    const { username, password, role, profile } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) {
      const existingUsername = await User.findOne({ username, userId: { $ne: userId } });
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      user.username = username;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.passwordHash = hashedPassword;
    }

    if (role) {
      const validRoles = ['senior', 'family', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role. Must be 'senior', 'family', or 'admin'" });
      }
      user.role = role;
    }

    if (profile) {
      if (profile.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.email)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }

        const existingEmail = await User.findOne({
          "profile.email": profile.email,
          userId: { $ne: userId }
        });

        if (existingEmail) {
          return res.status(400).json({ error: 'Email already in use' });
        }

        user.profile.email = profile.email;
      }

      if (profile.name !== undefined) user.profile.name = profile.name;
      if (profile.contact !== undefined) user.profile.contact = profile.contact;

      if (profile.age !== undefined) {
        const age = Number(profile.age);
        if (isNaN(age)) {
          return res.status(400).json({ error: 'Age must be a valid number' });
        }
        user.profile.age = age;
      }
    }

    await user.save();

    res.status(200).json({
      message: `User '${user.username}' updated successfully`,
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health and System Monitoring Endpoints
const SERVICE_START_TIME = Date.now();

// Helper function to check Games Service health
async function checkGamesServiceHealth() {
  try {
    const axios = require('axios');
    const response = await axios.get(`${GAMES_SERVICE_URL}/health`, { timeout: 3000 });
    return {
      status: 'online',
      responseTime: response.headers['x-response-time'] || 'N/A',
      details: response.data
    };
  } catch (error) {
    return {
      status: 'offline',
      responseTime: 'N/A',
      error: error.message
    };
  }
}

// Helper function to check service health (generic)
async function checkServiceHealth(serviceUrl, serviceName) {
  try {
    const axios = require('axios');
    const startTime = Date.now();
    const response = await axios.get(`${serviceUrl}/health`, { timeout: 3000 });
    const responseTime = Date.now() - startTime;
    return {
      status: 'online',
      responseTime: `${responseTime}ms`,
      details: response.data
    };
  } catch (error) {
    return {
      status: 'offline',
      responseTime: 'N/A',
      error: error.message
    };
  }
}

// Helper function to calculate uptime percentage
function calculateUptimePercentage() {
  // For now, assume 99.9% uptime - in production, this would track actual downtime
  return 99.9;
}

// GET /health - Overall system health
app.get('/health', async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const gamesServiceHealth = await checkGamesServiceHealth();

    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    const overallStatus = mongoStatus === 'connected' && gamesServiceHealth.status === 'online' ? 'healthy' : 'degraded';

    res.status(200).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: `${uptimeHours}h ${uptimeMinutes}m`,
      uptimeSeconds: Math.floor(uptime),
      services: {
        mongodb: mongoStatus,
        gamesService: gamesServiceHealth.status,
        apiGateway: 'online'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// GET /health/services - All services with detailed status
app.get('/health/services', async (req, res) => {
  try {
    const uptime = process.uptime();
    const uptimePercentage = calculateUptimePercentage();

    // Check MongoDB
    const mongoStatus = mongoose.connection.readyState === 1 ? 'online' : 'offline';
    const mongoResponseStart = Date.now();
    let mongoResponseTime = 0;
    if (mongoStatus === 'online') {
      try {
        await mongoose.connection.db.admin().ping();
        mongoResponseTime = Date.now() - mongoResponseStart;
      } catch (err) {
        mongoResponseTime = 0;
      }
    }

    // Check all microservices
    const gamesServiceHealth = await checkGamesServiceHealth();
    const notificationServiceHealth = await checkServiceHealth('http://notification-service:4002', 'notification-service');
    const pushNotificationServiceHealth = await checkServiceHealth('http://push-notification-service:4020', 'push-notification-service');
    const aiCompanionServiceHealth = await checkServiceHealth('http://ai-companion-service:4015', 'ai-companion-service');
    const smsServiceHealth = await checkServiceHealth('http://sms-service:4004', 'sms-service');
    const emailServiceHealth = await checkServiceHealth('http://email-service:4003', 'email-service');

    const services = [
      {
        id: 'api-gateway',
        name: 'API Gateway',
        status: 'online',
        uptime: uptimePercentage,
        responseTime: '< 10ms',
        endpoint: 'http://api-gateway:8080',
        lastChecked: new Date().toISOString(),
        details: {
          port: 8080,
          uptimeSeconds: Math.floor(uptime),
          startTime: new Date(SERVICE_START_TIME).toISOString()
        }
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        status: mongoStatus,
        uptime: mongoStatus === 'online' ? uptimePercentage : 0,
        responseTime: mongoStatus === 'online' ? `${mongoResponseTime}ms` : 'N/A',
        endpoint: MONGODB_URI,
        lastChecked: new Date().toISOString(),
        details: {
          port: 27017,
          connectionState: mongoose.connection.readyState,
          database: 'senior_care'
        }
      },
      {
        id: 'games-service',
        name: 'Games Service',
        status: gamesServiceHealth.status,
        uptime: gamesServiceHealth.status === 'online' ? uptimePercentage : 0,
        responseTime: gamesServiceHealth.responseTime,
        endpoint: GAMES_SERVICE_URL,
        lastChecked: new Date().toISOString(),
        details: gamesServiceHealth.details || { error: gamesServiceHealth.error }
      },
      {
        id: 'notification-service',
        name: 'Notification Service',
        status: notificationServiceHealth.status,
        uptime: notificationServiceHealth.status === 'online' ? uptimePercentage : 0,
        responseTime: notificationServiceHealth.responseTime,
        endpoint: 'http://notification-service:4002',
        lastChecked: new Date().toISOString(),
        details: notificationServiceHealth.details || { error: notificationServiceHealth.error }
      },
      {
        id: 'push-notification-service',
        name: 'Push Notification Service',
        status: pushNotificationServiceHealth.status,
        uptime: pushNotificationServiceHealth.status === 'online' ? uptimePercentage : 0,
        responseTime: pushNotificationServiceHealth.responseTime,
        endpoint: 'http://push-notification-service:4020',
        lastChecked: new Date().toISOString(),
        details: pushNotificationServiceHealth.details || { error: pushNotificationServiceHealth.error }
      },
      {
        id: 'ai-companion-service',
        name: 'AI Companion Service',
        status: aiCompanionServiceHealth.status,
        uptime: aiCompanionServiceHealth.status === 'online' ? uptimePercentage : 0,
        responseTime: aiCompanionServiceHealth.responseTime,
        endpoint: 'http://ai-companion-service:4015',
        lastChecked: new Date().toISOString(),
        details: aiCompanionServiceHealth.details || { error: aiCompanionServiceHealth.error }
      },
      {
        id: 'sms-service',
        name: 'SMS Service',
        status: smsServiceHealth.status,
        uptime: smsServiceHealth.status === 'online' ? uptimePercentage : 0,
        responseTime: smsServiceHealth.responseTime,
        endpoint: 'http://sms-service:4004',
        lastChecked: new Date().toISOString(),
        details: smsServiceHealth.details || { error: smsServiceHealth.error }
      },
      {
        id: 'email-service',
        name: 'Email Service',
        status: emailServiceHealth.status,
        uptime: emailServiceHealth.status === 'online' ? uptimePercentage : 0,
        responseTime: emailServiceHealth.responseTime,
        endpoint: 'http://email-service:4003',
        lastChecked: new Date().toISOString(),
        details: emailServiceHealth.details || { error: emailServiceHealth.error }
      }
    ];

    res.status(200).json({
      services,
      summary: {
        total: services.length,
        online: services.filter(s => s.status === 'online').length,
        offline: services.filter(s => s.status === 'offline').length,
        unknown: services.filter(s => s.status === 'unknown').length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Services health check error:', error);
    res.status(500).json({
      error: error.message,
      services: []
    });
  }
});

// GET /health/:service - Individual service health
app.get('/health/:service', async (req, res) => {
  try {
    const { service } = req.params;

    switch (service) {
      case 'api-gateway':
        res.status(200).json({
          service: 'api-gateway',
          status: 'online',
          uptime: process.uptime(),
          uptimePercentage: calculateUptimePercentage(),
          timestamp: new Date().toISOString()
        });
        break;

      case 'mongodb':
        const mongoStatus = mongoose.connection.readyState === 1 ? 'online' : 'offline';
        res.status(200).json({
          service: 'mongodb',
          status: mongoStatus,
          connectionState: mongoose.connection.readyState,
          timestamp: new Date().toISOString()
        });
        break;

      case 'games-service':
        const gamesHealth = await checkGamesServiceHealth();
        res.status(200).json({
          service: 'games-service',
          ...gamesHealth,
          timestamp: new Date().toISOString()
        });
        break;

      default:
        res.status(404).json({ error: 'Service not found' });
    }
  } catch (error) {
    console.error('Service health check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /system/metrics - System metrics
app.get('/system/metrics', async (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.status(200).json({
      timestamp: new Date().toISOString(),
      system: {
        uptime: Math.floor(uptime),
        uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        name: mongoose.connection.name,
        host: mongoose.connection.host
      }
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: error.message });
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