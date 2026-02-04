import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}

export async function teardownTestDB() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}
