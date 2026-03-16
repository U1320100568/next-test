import { route, routeOperation } from 'next-rest-framework';
import { z } from 'zod';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RefreshBody = z.object({ refreshToken: z.string().min(1) });
const RefreshResponse = z.object({ accessToken: z.string(), refreshToken: z.string() });

export const { POST } = route({
  userRefresh: routeOperation({ method: 'POST' })
    .input({ contentType: 'application/json', body: RefreshBody })
    .outputs([
      { status: 200, contentType: 'application/json', body: RefreshResponse },
      { status: 401, contentType: 'application/json', body: z.object({ error: z.string() }) },
    ])
    .handler(async (req) => {
      let body: z.infer<typeof RefreshBody>;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
      }
      const parsed = RefreshBody.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: '欄位驗證失敗' }, { status: 400 });
      }
      try {
        const payload = verifyRefreshToken(parsed.data.refreshToken);
        if (payload.type !== 'user') {
          return NextResponse.json({ error: 'Token 類型錯誤' }, { status: 401 });
        }
        const tokenPayload = { id: payload.id, username: payload.username, type: 'user' as const };
        return NextResponse.json({
          accessToken: signAccessToken(tokenPayload),
          refreshToken: signRefreshToken(tokenPayload),
        });
      } catch {
        return NextResponse.json({ error: 'Token 無效或已過期' }, { status: 401 });
      }
    }),
});
