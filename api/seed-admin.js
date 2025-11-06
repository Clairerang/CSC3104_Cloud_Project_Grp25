const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/seniorcare';

// Define User schema (same as in app.js)
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['senior', 'family', 'admin'], required: true },
  profile: {
    name: String,
    age: Number,
    email: String,
    contact: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seedAdminUser() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB!');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username: admin');
      console.log('You can update the password if needed by deleting and re-running this script.');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = new User({
      userId: uuidv4(),
      username: 'admin',
      passwordHash,
      role: 'admin',
      profile: {
        name: 'Admin User',
        age: null,
        email: 'admin@seniorconnect.com',
        contact: '+65 9890 1234'
      },
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@seniorconnect.com');
    console.log('Role: admin');
    console.log('-----------------------------------');
    console.log('You can now login to the admin portal with these credentials.');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');

  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdminUser();
