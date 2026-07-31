import app from './src/app.js';
import { connectDB, disconnectDB } from './src/config/database.js';
import dotenv from 'dotenv';

// Import models to register schemas
import './src/models/User.js';
import './src/models/Product.js';
import './src/models/Cart.js';
import './src/models/Order.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Start server after successful connection
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT. Shutting down gracefully...');
  await disconnectDB();
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM. Shutting down gracefully...');
  await disconnectDB();
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});
