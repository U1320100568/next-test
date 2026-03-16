import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/lib/models/AdminUser', () => ({
  AdminUser: { findOne: jest.fn() },
}));
jest.mock('@/lib/password', () => ({ verifyPassword: jest.fn() }));
jest.mock('@/lib/jwt', () => ({
  signAccessToken: jest.fn().mockReturnValue('mock-access-token'),
  signRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
}));

import { POST } from './route';
import { AdminUser } from '@/lib/models/AdminUser';
import { verifyPassword } from '@/lib/password';

const mockAdmin = { _id: 'admin-id', username: 'admin', email: 'admin@test.com', password: 'hashed' };

describe('POST /api/admin/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('登入成功應該返回 tokens', async () => {
    (AdminUser.findOne as jest.Mock).mockResolvedValue(mockAdmin);
    (verifyPassword as jest.Mock).mockResolvedValue(true);
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'password' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.accessToken).toBe('mock-access-token');
    expect(data.refreshToken).toBe('mock-refresh-token');
  });

  it('帳號不存在應該返回 401', async () => {
    (AdminUser.findOne as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'nobody', password: 'password' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(401);
  });

  it('密碼錯誤應該返回 401', async () => {
    (AdminUser.findOne as jest.Mock).mockResolvedValue(mockAdmin);
    (verifyPassword as jest.Mock).mockResolvedValue(false);
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'wrong' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(401);
  });

  it('缺少欄位應該返回 400', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(400);
  });
});
