import { route, routeOperation } from 'next-rest-framework';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/password';
import { requireAdminAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const UserItem = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  createdAt: z.string(),
});

const UpdateUserBody = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

export const { GET, PUT, DELETE } = route({
  getUser: routeOperation({ method: 'GET' })
    .outputs([{ status: 200, contentType: 'application/json', body: UserItem }])
    .handler(async (req: NextRequest, context?: { params?: Record<string, string> }) => {
      try {
        requireAdminAuth(req);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'UNAUTHORIZED';
        return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
      }
      const id = context?.params?.id;
      if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
      await connectDB();
      const user = await User.findById(id);
      if (!user) return NextResponse.json({ error: '使用者不存在' }, { status: 404 });
      return NextResponse.json({
        id: String(user._id),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      });
    }),

  updateUser: routeOperation({ method: 'PUT' })
    .input({ contentType: 'application/json', body: UpdateUserBody })
    .outputs([{ status: 200, contentType: 'application/json', body: UserItem }])
    .handler(async (req: NextRequest, context?: { params?: Record<string, string> }) => {
      try {
        requireAdminAuth(req);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'UNAUTHORIZED';
        return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
      }
      const id = context?.params?.id;
      if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
      let body: z.infer<typeof UpdateUserBody>;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
      }
      const parsed = UpdateUserBody.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: '欄位驗證失敗' }, { status: 400 });
      }
      await connectDB();
      const user = await User.findById(id);
      if (!user) return NextResponse.json({ error: '使用者不存在' }, { status: 404 });
      if (parsed.data.email) user.email = parsed.data.email;
      if (parsed.data.password) user.password = await hashPassword(parsed.data.password);
      await user.save();
      return NextResponse.json({
        id: String(user._id),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      });
    }),

  deleteUser: routeOperation({ method: 'DELETE' })
    .outputs([{ status: 200, contentType: 'application/json', body: z.object({ message: z.string() }) }])
    .handler(async (req: NextRequest, context?: { params?: Record<string, string> }) => {
      try {
        requireAdminAuth(req);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'UNAUTHORIZED';
        return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
      }
      const id = context?.params?.id;
      if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
      await connectDB();
      const user = await User.findByIdAndDelete(id);
      if (!user) return NextResponse.json({ error: '使用者不存在' }, { status: 404 });
      return NextResponse.json({ message: '使用者已刪除' });
    }),
});
