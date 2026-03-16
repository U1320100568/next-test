import { getTokenFromRequest, requireAdminAuth, requireUserAuth } from './auth';
import { signAccessToken } from './jwt';
import { NextRequest } from 'next/server';

function makeRequest(token?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (token) headers['authorization'] = `Bearer ${token}`;
  return new NextRequest('http://localhost/api/test', { headers });
}

describe('auth 工具', () => {
  describe('getTokenFromRequest', () => {
    it('應該從 Authorization header 取得 token', () => {
      const token = signAccessToken({ id: '1', username: 'u', type: 'user' });
      const req = makeRequest(token);
      expect(getTokenFromRequest(req)).toBe(token);
    });

    it('沒有 Authorization header 時應該返回 null', () => {
      const req = makeRequest();
      expect(getTokenFromRequest(req)).toBeNull();
    });
  });

  describe('requireAdminAuth', () => {
    it('有效的 admin token 應該通過驗證', () => {
      const token = signAccessToken({ id: '1', username: 'admin', type: 'admin' });
      const req = makeRequest(token);
      const payload = requireAdminAuth(req);
      expect(payload.type).toBe('admin');
    });

    it('沒有 token 應該拋出 UNAUTHORIZED 錯誤', () => {
      const req = makeRequest();
      expect(() => requireAdminAuth(req)).toThrow('UNAUTHORIZED');
    });

    it('使用者 token 嘗試 admin 路由應該拋出 FORBIDDEN 錯誤', () => {
      const token = signAccessToken({ id: '1', username: 'user', type: 'user' });
      const req = makeRequest(token);
      expect(() => requireAdminAuth(req)).toThrow('FORBIDDEN');
    });
  });

  describe('requireUserAuth', () => {
    it('有效的 user token 應該通過驗證', () => {
      const token = signAccessToken({ id: '1', username: 'user', type: 'user' });
      const req = makeRequest(token);
      const payload = requireUserAuth(req);
      expect(payload.type).toBe('user');
    });

    it('沒有 token 應該拋出 UNAUTHORIZED 錯誤', () => {
      const req = makeRequest();
      expect(() => requireUserAuth(req)).toThrow('UNAUTHORIZED');
    });

    it('管理員 token 嘗試 user 路由應該拋出 FORBIDDEN 錯誤', () => {
      const token = signAccessToken({ id: '1', username: 'admin', type: 'admin' });
      const req = makeRequest(token);
      expect(() => requireUserAuth(req)).toThrow('FORBIDDEN');
    });
  });
});
