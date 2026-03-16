import { state, TEST_USER, API_URL } from './fixtures';

describe('04 使用者 CRUD API', () => {
  it('未授權應該無法取得使用者列表', async () => {
    const res = await fetch(`${API_URL}/api/users`);
    expect(res.status).toBe(401);
  });

  it('管理員應該可以取得使用者列表', async () => {
    const res = await fetch(`${API_URL}/api/users`, {
      headers: { authorization: `Bearer ${state.adminAccessToken}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('使用者應該可以修改自己的密碼', async () => {
    const newPassword = 'NewUserPass456';
    const res = await fetch(`${API_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${state.userAccessToken}`,
      },
      body: JSON.stringify({ currentPassword: TEST_USER.password, newPassword }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe('密碼修改成功');
  });

  it('管理員應該可以刪除使用者', async () => {
    if (!state.userId) throw new Error('userId not set');
    const res = await fetch(`${API_URL}/api/users/${state.userId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${state.adminAccessToken}` },
    });
    expect(res.status).toBe(200);
  });
});
