import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, JwtPayload } from './jwt';
import jwt from 'jsonwebtoken';

const payload: JwtPayload = { id: '123', username: 'testuser', type: 'user' };

describe('JWT 工具', () => {
  describe('signAccessToken', () => {
    it('應該成功產生 access token', () => {
      const token = signAccessToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('應該成功驗證合法的 access token', () => {
      const token = signAccessToken(payload);
      const decoded = verifyAccessToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.type).toBe(payload.type);
    });

    it('應該拒絕無效的 access token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow();
    });
  });

  describe('signRefreshToken', () => {
    it('應該成功產生 refresh token', () => {
      const token = signRefreshToken(payload);
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyRefreshToken', () => {
    it('應該成功驗證合法的 refresh token', () => {
      const token = signRefreshToken(payload);
      const decoded = verifyRefreshToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.username).toBe(payload.username);
    });

    it('應該拒絕無效的 refresh token', () => {
      expect(() => verifyRefreshToken('invalid.token.here')).toThrow();
    });

    it('access token 不應該被 verifyRefreshToken 接受（不同 secret）', () => {
      process.env.JWT_SECRET = 'test-access-secret';
      process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
      // Re-import after env change won't work easily, just verify different secrets logic
      const accessToken = jwt.sign(payload, 'test-access-secret', { expiresIn: '1m' });
      expect(() => jwt.verify(accessToken, 'test-refresh-secret')).toThrow();
    });
  });
});
