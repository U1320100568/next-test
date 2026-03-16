import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/lib/models/User', () => ({
  User: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  },
}));
jest.mock('@/lib/password', () => ({ hashPassword: jest.fn().mockResolvedValue('hashed') }));
jest.mock('@/lib/auth', () => ({ requireAdminAuth: jest.fn() }));

import { GET, POST } from './route';
import { User } from '@/lib/models/User';
import { requireAdminAuth } from '@/lib/auth';

const mockUsers = [
  { _id: 'id1', username: 'user1', email: 'u1@test.com', createdAt: new Date('2024-01-01') },
];

describe('GET /api/users', () => {
  beforeEach(() => jest.clearAllMocks());

  it('管理員可以列出使用者', async () => {
    (requireAdminAuth as jest.Mock).mockReturnValue({ id: 'admin-id', type: 'admin' });
    (User.countDocuments as jest.Mock).mockResolvedValue(1);
    (User.find as jest.Mock).mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockUsers),
    });
    const req = new NextRequest('http://localhost/api/users?page=1&limit=10');
    const res = await GET(req, { params: {} });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.total).toBe(1);
  });

  it('未授權應該返回 401', async () => {
    (requireAdminAuth as jest.Mock).mockImplementation(() => { throw new Error('UNAUTHORIZED'); });
    const req = new NextRequest('http://localhost/api/users');
    const res = await GET(req, { params: {} });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/users', () => {
  beforeEach(() => jest.clearAllMocks());

  it('管理員可以建立使用者', async () => {
    (requireAdminAuth as jest.Mock).mockReturnValue({ id: 'admin-id', type: 'admin' });
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue({
      _id: 'new-id', username: 'newuser', email: 'new@test.com', createdAt: new Date(),
    });
    const req = new NextRequest('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({ username: 'newuser', email: 'new@test.com', password: 'pass123' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(201);
  });

  it('重複帳號應該返回 409', async () => {
    (requireAdminAuth as jest.Mock).mockReturnValue({ id: 'admin-id', type: 'admin' });
    (User.findOne as jest.Mock).mockResolvedValue({ username: 'existing' });
    const req = new NextRequest('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({ username: 'existing', email: 'new@test.com', password: 'pass123' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req, { params: {} });
    expect(res.status).toBe(409);
  });
});
