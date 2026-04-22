import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// In Vercel serverless, we don't need to load .env file
// Environment variables are already available via process.env
// Only load .env in local development
if (process.env.VERCEL !== '1') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'restaurant_db';

let client = null;
let db = null;

export async function connectDatabase() {
  try {
    if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017') {
      const error = new Error('MONGODB_URI is not configured. Please set it in environment variables.');
      console.error('❌', error.message);
      throw error;
    }

    if (!client) {
      console.log('Connecting to MongoDB...', { 
        uri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials
        database: DATABASE_NAME 
      });
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      console.log('✅ Đã kết nối MongoDB thành công');
    }
    
    if (!db) {
      db = client.db(DATABASE_NAME);
    }
    
    return db;
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database chưa được kết nối. Gọi connectDatabase() trước.');
  }
  return db;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✅ Đã đóng kết nối MongoDB');
  }
}

