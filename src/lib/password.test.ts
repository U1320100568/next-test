import { hashPassword, verifyPassword } from './password';

describe('password 工具', () => {
  it('應該成功雜湊密碼', async () => {
    const hash = await hashPassword('mypassword');
    expect(hash).not.toBe('mypassword');
    expect(hash.startsWith('$2')).toBe(true);
  });

  it('正確密碼應該驗證成功', async () => {
    const hash = await hashPassword('mypassword');
    const result = await verifyPassword('mypassword', hash);
    expect(result).toBe(true);
  });

  it('錯誤密碼應該驗證失敗', async () => {
    const hash = await hashPassword('mypassword');
    const result = await verifyPassword('wrongpassword', hash);
    expect(result).toBe(false);
  });

  it('相同密碼應該產生不同的雜湊值', async () => {
    const hash1 = await hashPassword('mypassword');
    const hash2 = await hashPassword('mypassword');
    expect(hash1).not.toBe(hash2);
  });
});
