import { execSync } from 'child_process';
import mongoose from 'mongoose';
import { AdminUser } from '../src/lib/models/AdminUser';
import { state, TEST_ADMIN, MONGODB_URI, MONGODB_DB_NAME } from './fixtures';

const SCRIPT = 'npx ts-node scripts/manage-admin.ts';

describe('01 管理員管理腳本', () => {
  beforeAll(async () => {
    process.env.MONGODB_URI = MONGODB_URI;
    process.env.MONGODB_DB_NAME = MONGODB_DB_NAME;
    await mongoose.connect(`${MONGODB_URI}/${MONGODB_DB_NAME}`);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('應該可以建立管理員帳號', () => {
    const output = execSync(
      `${SCRIPT} create --username ${TEST_ADMIN.username} --email ${TEST_ADMIN.email} --password ${TEST_ADMIN.password}`,
      { env: { ...process.env, MONGODB_URI, MONGODB_DB_NAME } }
    ).toString();
    expect(output).toContain('管理員建立成功');
  });

  it('建立後應該可以在資料庫中查詢到管理員', async () => {
    const admin = await AdminUser.findOne({ username: TEST_ADMIN.username });
    expect(admin).not.toBeNull();
    expect(admin?.email).toBe(TEST_ADMIN.email);
    state.adminId = String(admin?._id);
  });

  it('應該可以列出所有管理員', () => {
    const output = execSync(`${SCRIPT} list`, {
      env: { ...process.env, MONGODB_URI, MONGODB_DB_NAME },
    }).toString();
    expect(output).toContain(TEST_ADMIN.username);
  });

  it('應該可以更新管理員電子郵件', () => {
    if (!state.adminId) throw new Error('adminId not set');
    const newEmail = 'updated_admin@integration.test';
    const output = execSync(
      `${SCRIPT} update --id ${state.adminId} --email ${newEmail}`,
      { env: { ...process.env, MONGODB_URI, MONGODB_DB_NAME } }
    ).toString();
    expect(output).toContain('管理員更新成功');
  });
});
