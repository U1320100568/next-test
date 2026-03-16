import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/lib/models/User', () => ({ User: { findById: jest.fn() } }));
jest.mock('@/lib/password', () => ({
  verifyPassword: jest.fn(),
  hashPassword: jest.fn().mockResolvedValue('new-hashed'),
}));
jest.mock('@/lib/auth', () => ({ requireUserAuth: jest.fn() }));

import { POST } from './route';
import { User } from '@/lib/models/User';
import { verifyPassword } from '@/lib/password';
import { requireUserAuth } from '@/lib/auth';

const mockUser = {
  _id: 'user-id',
  username: 'user1',
  password: 'hashed',
  save: jest.fn(),
};

describe('POST /api/auth/change-password', () => {
  beforeEach(() => jest.clearAllMocks());

  it('修改密碼成功', async () => {
    (requireUserAuth as jest.Mock).mockReturnValue({ id: 'user-id', username: 'user1', type: 'user' });
    (User.findById as jest.Mock).mockResolvedValue({ ...mockUser, save: jest.fn() });
    (verifyPassword as jest.Mock).mockResolvedValue(true);
    const req = new NextRequest('http://localhost/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: 'old', newPassword: 'newpass123' }),
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer token' },
    });
    const res = await POST(req, { params: {} });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.message).toBe('密碼修改成功');
  });

  it('未授權應該返回 401', async () => {
    (requireUserAuth as jest.Mock).mockImplementation(() => { throw new Error('UNAUTHORIZED'); });
    const req = new NextRequest('http://localhost/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: 'old', newPassword: 'newpass123' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(401);
  });

  it('目前密碼錯誤應該返回 401', async () => {
    (requireUserAuth as jest.Mock).mockReturnValue({ id: 'user-id', username: 'user1', type: 'user' });
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (verifyPassword as jest.Mock).mockResolvedValue(false);
    const req = new NextRequest('http://localhost/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: 'wrong', newPassword: 'newpass123' }),
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer token' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(401);
  });
});
