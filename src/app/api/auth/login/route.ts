import { route, routeOperation } from 'next-rest-framework';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
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
  user: z.object({ id: z.string(), username: z.string(), email: z.string() }),
});

export const { POST } = route({
  userLogin: routeOperation({ method: 'POST' })
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
      const user = await User.findOne({ username });
      if (!user) {
        return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
      }
      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
      }
      const tokenPayload = { id: String(user._id), username: user.username, type: 'user' as const };
      const accessToken = signAccessToken(tokenPayload);
      const refreshToken = signRefreshToken(tokenPayload);
      return NextResponse.json({
        accessToken,
        refreshToken,
        user: { id: String(user._id), username: user.username, email: user.email },
      });
    }),
});
