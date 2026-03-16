import { NextRequest } from 'next/server';
import { verifyAccessToken, JwtPayload } from './jwt';

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export function requireAdminAuth(req: NextRequest): JwtPayload {
  const token = getTokenFromRequest(req);
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }
  const payload = verifyAccessToken(token);
  if (payload.type !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  return payload;
}

export function requireUserAuth(req: NextRequest): JwtPayload {
  const token = getTokenFromRequest(req);
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }
  const payload = verifyAccessToken(token);
  if (payload.type !== 'user') {
    throw new Error('FORBIDDEN');
  }
  return payload;
}
