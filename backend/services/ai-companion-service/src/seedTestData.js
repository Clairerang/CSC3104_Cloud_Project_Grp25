// Seed test data for users and relationships
const mongoose = require('mongoose');
const User = require('./models/User');
const Relationship = require('./models/Relationship');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/ai-companion';

async function seedTestData() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Create test senior user
    const senior = await User.findOneAndUpdate(
      { userId: 'senior-1' },
      {
        userId: 'senior-1',
        username: 'senior1',
        passwordHash: '$2b$10$dummyHashForTesting',
        role: 'senior',
        profile: {
          name: 'Mr. Tan Ah Kow',
          age: 72,
          email: 'senior1@example.com',
          contact: '+6591234567',
          address: 'Sengkang',
          phoneNumber: '+6591234567',
          emailContact: 'senior1@example.com'
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Created/Updated senior user:', senior.userId);

    // Create test family member (son)
    const son = await User.findOneAndUpdate(
      { userId: 'family-son-1' },
      {
        userId: 'family-son-1',
        username: 'son1',
        passwordHash: '$2b$10$dummyHashForTesting',
        role: 'family',
        profile: {
          name: 'David Tan',
          age: 45,
          email: 'cloudproject6769@gmail.com',
          contact: '+6598765787',
          address: 'Sengkang',
          phoneNumber: '+6598765787',
          emailContact: 'cloudproject6769@gmail.com'
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Created/Updated family member (son):', son.userId);

    // Create relationship
    const relationship = await Relationship.findOneAndUpdate(
      { seniorId: senior.userId, linkAccId: son.userId },
      {
        seniorId: senior.userId,
        linkAccId: son.userId,
        relation: 'Son'
      },
      { upsert: true, new: true }
    );
    console.log('✅ Created/Updated relationship:', relationship);

    console.log('\n🎉 Test data seeded successfully!');
    console.log('\n📝 Test Users Created:');
    console.log('   Senior: senior-1 (Mr. Tan Ah Kow)');
    console.log('   Son: family-son-1 (David Tan)');
    console.log('   Phone: +6598765787');
    console.log('   Email: cloudproject6769@gmail.com');
    console.log('\n💡 You can now test "Call my son" in the AI chat!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedTestData();
