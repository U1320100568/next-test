import { route, routeOperation } from 'next-rest-framework';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { AdminUser } from '@/lib/models/AdminUser';
import { verifyPassword } from '@/lib/password';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LoginBody = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const LoginResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
  }),
});

export const { POST } = route({
  login: routeOperation({ method: 'POST' })
    .input({ contentType: 'application/json', body: LoginBody })
    .outputs([
      { status: 200, contentType: 'application/json', body: LoginResponse },
      { status: 401, contentType: 'application/json', body: z.object({ error: z.string() }) },
    ])
    .handler(async (req) => {
      let body: z.infer<typeof LoginBody>;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
      }
      const parsed = LoginBody.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: '欄位驗證失敗' }, { status: 400 });
      }
      const { username, password } = parsed.data;
      await connectDB();
      const admin = await AdminUser.findOne({ username });
      if (!admin) {
        return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
      }
      const valid = await verifyPassword(password, admin.password);
      if (!valid) {
        return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
      }
      const tokenPayload = { id: String(admin._id), username: admin.username, type: 'admin' as const };
      const accessToken = signAccessToken(tokenPayload);
      const refreshToken = signRefreshToken(tokenPayload);
      return NextResponse.json({
        accessToken,
        refreshToken,
        user: { id: String(admin._id), username: admin.username, email: admin.email },
      });
    }),
});
