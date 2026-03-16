import { execSync } from 'child_process';
import mongoose from 'mongoose';
import { User } from '../src/lib/models/User';
import { state, TEST_USER, MONGODB_URI, MONGODB_DB_NAME } from './fixtures';

const SCRIPT = 'npx ts-node scripts/manage-user.ts';

describe('02 使用者管理腳本', () => {
  beforeAll(async () => {
    process.env.MONGODB_URI = MONGODB_URI;
    process.env.MONGODB_DB_NAME = MONGODB_DB_NAME;
    await mongoose.connect(`${MONGODB_URI}/${MONGODB_DB_NAME}`);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('應該可以建立使用者帳號', () => {
    const output = execSync(
      `${SCRIPT} create --username ${TEST_USER.username} --email ${TEST_USER.email} --password ${TEST_USER.password}`,
      { env: { ...process.env, MONGODB_URI, MONGODB_DB_NAME } }
    ).toString();
    expect(output).toContain('使用者建立成功');
  });

  it('建立後應該可以在資料庫中查詢到使用者', async () => {
    const user = await User.findOne({ username: TEST_USER.username });
    expect(user).not.toBeNull();
    expect(user?.email).toBe(TEST_USER.email);
    state.userId = String(user?._id);
  });

  it('應該可以列出所有使用者', () => {
    const output = execSync(`${SCRIPT} list`, {
      env: { ...process.env, MONGODB_URI, MONGODB_DB_NAME },
    }).toString();
    expect(output).toContain(TEST_USER.username);
  });
});
