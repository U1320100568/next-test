import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/lib/models/User', () => ({
  User: { findById: jest.fn(), findByIdAndDelete: jest.fn() },
}));
jest.mock('@/lib/password', () => ({ hashPassword: jest.fn().mockResolvedValue('hashed') }));
jest.mock('@/lib/auth', () => ({ requireAdminAuth: jest.fn() }));

import { GET, PUT, DELETE } from './route';
import { User } from '@/lib/models/User';
import { requireAdminAuth } from '@/lib/auth';

const mockUser = {
  _id: 'user-id',
  username: 'user1',
  email: 'user@test.com',
  createdAt: new Date('2024-01-01'),
  save: jest.fn(),
};

const ctx = { params: { id: 'user-id' } };

describe('GET /api/users/[id]', () => {
  beforeEach(() => jest.clearAllMocks());

  it('管理員可以取得使用者資料', async () => {
    (requireAdminAuth as jest.Mock).mockReturnValue({ id: 'admin', type: 'admin' });
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    const req = new NextRequest('http://localhost/api/users/user-id');
    const res = await GET(req, ctx);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.username).toBe('user1');
  });

  it('使用者不存在應該返回 404', async () => {
    (requireAdminAuth as jest.Mock).mockReturnValue({ id: 'admin', type: 'admin' });
    (User.findById as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/users/notexist');
    const res = await GET(req, { params: { id: 'notexist' } });
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/users/[id]', () => {
  beforeEach(() => jest.clearAllMocks());

  it('管理員可以更新使用者', async () => {
    (requireAdminAuth as jest.Mock).mockReturnValue({ id: 'admin', type: 'admin' });
    (User.findById as jest.Mock).mockResolvedValue({ ...mockUser, save: jest.fn() });
    const req = new NextRequest('http://localhost/api/users/user-id', {
      method: 'PUT',
      body: JSON.stringify({ email: 'new@test.com' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await PUT(req, ctx);
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/users/[id]', () => {
  beforeEach(() => jest.clearAllMocks());

  it('管理員可以刪除使用者', async () => {
    (requireAdminAuth as jest.Mock).mockReturnValue({ id: 'admin', type: 'admin' });
    (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);
    const req = new NextRequest('http://localhost/api/users/user-id', { method: 'DELETE' });
    const res = await DELETE(req, ctx);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.message).toBe('使用者已刪除');
  });

  it('使用者不存在應該返回 404', async () => {
    (requireAdminAuth as jest.Mock).mockReturnValue({ id: 'admin', type: 'admin' });
    (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/users/notexist', { method: 'DELETE' });
    const res = await DELETE(req, { params: { id: 'notexist' } });
    expect(res.status).toBe(404);
  });
});
