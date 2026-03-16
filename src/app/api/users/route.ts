import { route, routeOperation } from 'next-rest-framework';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/password';
import { requireAdminAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const CreateUserBody = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const UserItem = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  createdAt: z.string(),
});

const ListResponse = z.object({
  data: z.array(UserItem),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const { GET, POST } = route({
  listUsers: routeOperation({ method: 'GET' })
    .outputs([
      { status: 200, contentType: 'application/json', body: ListResponse },
    ])
    .handler(async (req: NextRequest) => {
      try {
        requireAdminAuth(req);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'UNAUTHORIZED';
        return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
      }
      const { searchParams } = new URL(req.url);
      const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
      await connectDB();
      const total = await User.countDocuments();
      const users = await User.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
      return NextResponse.json({
        data: users.map((u) => ({
          id: String(u._id),
          username: u.username,
          email: u.email,
          createdAt: u.createdAt.toISOString(),
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }),

  createUser: routeOperation({ method: 'POST' })
    .input({ contentType: 'application/json', body: CreateUserBody })
    .outputs([
      { status: 201, contentType: 'application/json', body: UserItem },
    ])
    .handler(async (req: NextRequest) => {
      try {
        requireAdminAuth(req);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'UNAUTHORIZED';
        return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
      }
      let body: z.infer<typeof CreateUserBody>;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
      }
      const parsed = CreateUserBody.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: '欄位驗證失敗' }, { status: 400 });
      }
      await connectDB();
      const existing = await User.findOne({
        $or: [{ username: parsed.data.username }, { email: parsed.data.email }],
      });
      if (existing) {
        return NextResponse.json({ error: '使用者名稱或電子郵件已被使用' }, { status: 409 });
      }
      const hashed = await hashPassword(parsed.data.password);
      const user = await User.create({ ...parsed.data, password: hashed });
      return NextResponse.json({
        id: String(user._id),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      }, { status: 201 });
    }),
});
