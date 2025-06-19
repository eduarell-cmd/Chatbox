const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('si conecto');
  } catch (err) {
    console.error('valio maye:', err);
    process.exit(1);
  }
}

module.exports = connectDB;
