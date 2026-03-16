import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/lib/models/User', () => ({ User: { findOne: jest.fn() } }));
jest.mock('@/lib/password', () => ({ verifyPassword: jest.fn() }));
jest.mock('@/lib/jwt', () => ({
  signAccessToken: jest.fn().mockReturnValue('access'),
  signRefreshToken: jest.fn().mockReturnValue('refresh'),
}));

import { POST } from './route';
import { User } from '@/lib/models/User';
import { verifyPassword } from '@/lib/password';

const mockUser = { _id: 'user-id', username: 'user1', email: 'user@test.com', password: 'hashed' };

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('登入成功應該返回 tokens', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (verifyPassword as jest.Mock).mockResolvedValue(true);
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'user1', password: 'password' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.accessToken).toBe('access');
  });

  it('帳號不存在應該返回 401', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'nobody', password: 'pw' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(401);
  });

  it('密碼錯誤應該返回 401', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (verifyPassword as jest.Mock).mockResolvedValue(false);
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'user1', password: 'wrong' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(401);
  });

  it('缺少欄位應該返回 400', async () => {
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'user1' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(400);
  });
});
