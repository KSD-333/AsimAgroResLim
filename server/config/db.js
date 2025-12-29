const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asim-agro');

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('\n📌 To fix this:');
    console.error('   1. Go to MongoDB Atlas → Network Access');
    console.error('   2. Click "Add IP Address"');
    console.error('   3. Click "Allow Access from Anywhere" (0.0.0.0/0)');
    console.error('   4. Restart this server\n');
    // Don't exit, let server run without DB for now
    console.log('⚠️  Server running without database connection');
  }
};

module.exports = connectDB;
