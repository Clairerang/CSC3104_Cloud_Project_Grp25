const { User, Relationship, Engagement } = require('./app');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const MONGO_URL = 'mongodb://localhost:27017/cloud';

async function createSampleData() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('Connected to MongoDB!');

  const passwordHash = await bcrypt.hash('password123', 10);

  const senior = new User({
    userId: uuidv4(),
    username: 'senior1',
    passwordHash,
    role: 'senior',
    profile: { name: 'Bob', age: 75, email: 'bob@gmail.com', contact: '84119824' },
  });

  const family1 = new User({
    userId: uuidv4(),
    username: 'family1',
    passwordHash,
    role: 'family',
    profile: { name: 'Amos', age: 45, email: 'amos@gmail.com', contact: '91356698' },
  });

  const family2 = new User({
    userId: uuidv4(),
    username: 'family2',
    passwordHash,
    role: 'family',
    profile: { name: 'John', age: 50, email: 'john@gmail.com', contact: '97587131' },
  });

  await senior.save();
  await family1.save();
  await family2.save();

  console.log('Users created');

  const rel1 = new Relationship({
    seniorId: senior.userId,
    linkAccId: family1.userId,
    relation: 'son',
  });

  const rel2 = new Relationship({
    seniorId: senior.userId,
    linkAccId: family2.userId,
    relation: 'son',
  });

  await rel1.save();
  await rel2.save();

  console.log('Relationships created');

  const today = new Date().toISOString().split('T')[0];

  const engagement = new Engagement({
    userId: senior.userId,
    date: today,
    checkIn: true,
    tasksCompleted: [
      { type: 'task1', points: 5 },
      { type: 'task2', points: 10 },
    ],
    totalScore: 15,
    lastActiveAt: new Date(),
  });

  await engagement.save();

  console.log('Engagement created');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Sample data population done!');
}

createSampleData().catch(console.error);
