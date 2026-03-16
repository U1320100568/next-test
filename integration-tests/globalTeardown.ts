import mongoose from 'mongoose';
import { MONGODB_URI, MONGODB_DB_NAME } from './fixtures';

export default async function globalTeardown() {
  try {
    await mongoose.connect(`${MONGODB_URI}/${MONGODB_DB_NAME}`);
    await mongoose.connection.db?.dropDatabase();
    await mongoose.disconnect();
    console.log('✅ Test database cleaned up');
  } catch (e) {
    console.error('Teardown error:', e);
  }
}
