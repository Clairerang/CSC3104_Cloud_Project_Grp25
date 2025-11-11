const { User, Relationship, Engagement } = require('./models');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/senior_care';

async function createSampleData() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('Connected to MongoDB!');

  // Clear existing users, relationships, and engagements
  console.log('Clearing existing user data...');
  await User.deleteMany({});
  await Relationship.deleteMany({});
  await Engagement.deleteMany({});
  console.log('Existing user data cleared');

  // Create password hashes for known passwords
  const password123Hash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // Create Admin User
  const admin = new User({
    userId: uuidv4(),
    username: 'admin',
    passwordHash: adminPasswordHash,
    role: 'admin',
    profile: { name: 'System Administrator', email: 'admin@seniorcare.com', contact: '+65 6123 4567' },
  });

  // Create Senior Users
  const senior1 = new User({
    userId: uuidv4(),
    username: 'senior1',
    passwordHash: password123Hash,
    role: 'senior',
    profile: { name: 'Mary Johnson', age: 75, email: 'mary@gmail.com', contact: '+65 8411 9824' },
  });

  const senior2 = new User({
    userId: uuidv4(),
    username: 'senior2',
    passwordHash: password123Hash,
    role: 'senior',
    profile: { name: 'Robert Lee', age: 68, email: 'robert@gmail.com', contact: '+65 9234 5678' },
  });

  // Create Family Members
  const family1 = new User({
    userId: uuidv4(),
    username: 'family1',
    passwordHash: password123Hash,
    role: 'family',
    profile: { name: 'Sarah Johnson', age: 45, email: 'sarah@gmail.com', contact: '+65 9135 6698' },
  });

  const family2 = new User({
    userId: uuidv4(),
    username: 'family2',
    passwordHash: password123Hash,
    role: 'family',
    profile: { name: 'Michael Johnson', age: 50, email: 'michael@gmail.com', contact: '+65 9758 7131' },
  });

  const family3 = new User({
    userId: uuidv4(),
    username: 'family3',
    passwordHash: password123Hash,
    role: 'family',
    profile: { name: 'Emma Lee', age: 42, email: 'emma@gmail.com', contact: '+65 8765 4321' },
  });

  // Save all users
  await admin.save();
  await senior1.save();
  await senior2.save();
  await family1.save();
  await family2.save();
  await family3.save();

  console.log('Users created (6 total: 1 admin, 2 seniors, 3 family members)');

  // Create Relationships (Family members linked to seniors)
  // Mary Johnson's family
  const rel1 = new Relationship({
    seniorId: senior1.userId,
    linkAccId: family1.userId,
    relation: 'daughter',
  });

  const rel2 = new Relationship({
    seniorId: senior1.userId,
    linkAccId: family2.userId,
    relation: 'son',
  });

  // Robert Lee's family
  const rel3 = new Relationship({
    seniorId: senior2.userId,
    linkAccId: family3.userId,
    relation: 'daughter',
  });

  await rel1.save();
  await rel2.save();
  await rel3.save();

  console.log('Relationships created (3 total)');

  // Create sample engagement for senior1 (Mary) - morning check-in
  const today = new Date().toISOString().split('T')[0];

  const engagement1 = new Engagement({
    userId: senior1.userId,
    date: today,
    session: 'morning',
    mood: 'great',
    checkIn: true,
    tasksCompleted: [
      { type: 'trivia', points: 15 },
      { type: 'memory', points: 15 },
    ],
    totalScore: 30,
    lastActiveAt: new Date(),
  });

  await engagement1.save();

  console.log('Sample engagement created for Mary Johnson (morning check-in)');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Sample data population done!');
}

createSampleData().catch(console.error);
