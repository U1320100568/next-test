import { NextRequest } from 'next/server';

jest.mock('@/lib/jwt', () => ({
  verifyRefreshToken: jest.fn(),
  signAccessToken: jest.fn().mockReturnValue('new-access'),
  signRefreshToken: jest.fn().mockReturnValue('new-refresh'),
}));

import { POST } from './route';
import { verifyRefreshToken } from '@/lib/jwt';

describe('POST /api/auth/refresh', () => {
  beforeEach(() => jest.clearAllMocks());

  it('有效的 user refresh token 應該返回新 tokens', async () => {
    (verifyRefreshToken as jest.Mock).mockReturnValue({ id: '1', username: 'user', type: 'user' });
    const req = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'valid' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.accessToken).toBe('new-access');
  });

  it('無效 token 應該返回 401', async () => {
    (verifyRefreshToken as jest.Mock).mockImplementation(() => { throw new Error('invalid'); });
    const req = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'bad' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(401);
  });

  it('admin token 嘗試 user refresh 應該返回 401', async () => {
    (verifyRefreshToken as jest.Mock).mockReturnValue({ id: '1', username: 'admin', type: 'admin' });
    const req = new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'admin-token' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
