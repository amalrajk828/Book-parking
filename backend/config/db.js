import mongoose from 'mongoose';

const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`[DATABASE] Attempting to connect to MongoDB (Attempt ${i}/${retries})...`);
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      });
      console.log(`\n==================================================`);
      console.log(`[DATABASE CONNECTED SUCCESS]`);
      console.log('MongoDB Connected Successfully');
      console.log(`Database Name: ${conn.connection.name}`);
      console.log(`==================================================\n`);
      return;
    } catch (error) {
      console.error(`[DATABASE ERROR] Connection attempt ${i} failed. Reason: ${error.message}`);
      if (i < retries) {
        console.warn(`[DATABASE RETRY] Waiting ${delay / 1000} seconds before retrying connection...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('FATAL DATABASE ERROR: Could not connect to MongoDB Atlas after maximum retries.');
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        } else {
          console.warn('[DATABASE STANDBY] Running in development mode. Server will remain online but API endpoints calling database will fail until connection is resolved.');
        }
      }
    }
  }
};

export default connectDB;