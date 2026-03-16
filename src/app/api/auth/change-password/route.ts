import { route, routeOperation } from 'next-rest-framework';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { verifyPassword, hashPassword } from '@/lib/password';
import { requireUserAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const ChangePasswordBody = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const { POST } = route({
  changePassword: routeOperation({ method: 'POST' })
    .input({ contentType: 'application/json', body: ChangePasswordBody })
    .outputs([
      { status: 200, contentType: 'application/json', body: z.object({ message: z.string() }) },
      { status: 401, contentType: 'application/json', body: z.object({ error: z.string() }) },
    ])
    .handler(async (req: NextRequest) => {
      let payload;
      try {
        payload = requireUserAuth(req);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'UNAUTHORIZED';
        return NextResponse.json({ error: msg === 'FORBIDDEN' ? '權限不足' : '未授權' }, { status: 401 });
      }
      let body: z.infer<typeof ChangePasswordBody>;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
      }
      const parsed = ChangePasswordBody.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: '欄位驗證失敗' }, { status: 400 });
      }
      const { currentPassword, newPassword } = parsed.data;
      await connectDB();
      const user = await User.findById(payload.id);
      if (!user) {
        return NextResponse.json({ error: '使用者不存在' }, { status: 404 });
      }
      const valid = await verifyPassword(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: '目前密碼不正確' }, { status: 401 });
      }
      user.password = await hashPassword(newPassword);
      await user.save();
      return NextResponse.json({ message: '密碼修改成功' });
    }),
});
