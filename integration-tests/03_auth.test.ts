import { state, TEST_ADMIN, TEST_USER, API_URL } from './fixtures';

describe('03 認證 API', () => {
  it('管理員應該可以成功登入', async () => {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: TEST_ADMIN.username, password: TEST_ADMIN.password }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.accessToken).toBeTruthy();
    state.adminAccessToken = data.accessToken;
  });

  it('管理員密碼錯誤應該返回 401', async () => {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: TEST_ADMIN.username, password: 'wrongpassword' }),
    });
    expect(res.status).toBe(401);
  });

  it('使用者應該可以成功登入', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: TEST_USER.username, password: TEST_USER.password }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.accessToken).toBeTruthy();
    state.userAccessToken = data.accessToken;
  });

  it('使用者密碼錯誤應該返回 401', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: TEST_USER.username, password: 'wrongpassword' }),
    });
    expect(res.status).toBe(401);
  });
});
