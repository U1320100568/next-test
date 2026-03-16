export interface TestState {
  adminId?: string;
  userId?: string;
  userAccessToken?: string;
  adminAccessToken?: string;
}

export const state: TestState = {};

export const TEST_ADMIN = {
  username: 'test_admin',
  email: 'test_admin@integration.test',
  password: 'AdminPass123',
};

export const TEST_USER = {
  username: 'test_user',
  email: 'test_user@integration.test',
  password: 'UserPass123',
};

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018';
export const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'next-test-integration';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
