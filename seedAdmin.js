const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://cipcolimited_db_user:2vWtikBrDIZCLxZL@cluster0.dqs6jwz.mongodb.net/cipco', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Dummy admin users
    const dummyUsers = [
      {
        email: 'admin@cipco.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        isActive: true
      },
      {
        email: 'superadmin@cipco.com',
        password: 'super123',
        name: 'Super Admin',
        role: 'superadmin',
        isActive: true
      }
    ];

    for (const userData of dummyUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create new user
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding admins:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeder
seedAdmins();
