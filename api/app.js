const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8080;

app.use(express.json());
const JWT_SECRET = 'secret1234@';

mongoose.connect('mongodb://localhost:27017/cloud', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB!'))
.catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['senior', 'family', 'admin'], required: true },
  profile: {
    name: String,
    age: Number,
    contact: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const relationshipSchema = new mongoose.Schema({
  seniorId: { type: String, required: true },
  linkAccId: { type: String, required: true },
  relation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

relationshipSchema.index({ seniorId: 1, linkAccId: 1 }, { unique: true });

const Relationship = mongoose.model('Relationship', relationshipSchema);


const engagementSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true }, 
  checkIn: { type: Boolean, default: false },
  tasksCompleted: [
    {
      type: { type: String },
      points: { type: Number, default: 0 }
    }
  ],
  totalScore: { type: Number, default: 0 },
  lastActiveAt: { type: Date, default: Date.now }
}, { timestamps: true });

engagementSchema.index({ userId: 1, date: 1 }, { unique: true });

const Engagement = mongoose.model('Engagement', engagementSchema);

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

app.post('/register', async (req, res) => {
  try {
    const { username, password, role, profile } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: "username, password, and role are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
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

app.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; 

    const userExists = await User.findOne({ userId });
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    const today = new Date().toISOString().split("T")[0];
    const existingEngagement = await Engagement.findOne({ userId, date: today });

    if (existingEngagement) {
      return res.status(400).json({ error: "Already checked in today" });
    }

    const newEngagement = new Engagement({
      userId,
      date: today,
      checkIn: true,
      tasksCompleted: [],
      totalScore: 0,
      lastActiveAt: new Date()
    });

    await newEngagement.save();

    res.status(201).json({
      message: "Check-in recorded successfully",
      engagement: newEngagement
    });

  } catch (error) {
    console.error("Error during check-in:", error);
    res.status(500).json({ error: "Server error" });
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

    const { type, points, date } = req.body;

    if (!type || typeof points !== 'number') {
      return res.status(400).json({ error: 'Task type and points are required' });
    }

    const engagementDate = date || new Date().toISOString().split('T')[0];
    let engagement = await Engagement.findOne({ userId, date: engagementDate });

    if (!engagement) {
      engagement = new Engagement({
        userId,
        date: engagementDate,
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
      message: `Task added successfully for ${engagementDate}`,
      engagement
    });

  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
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
        username: user.username,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
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