'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { useUserAuth } from './UserAuthProvider';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.username, values.password);
      onSuccess?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '登入失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} style={{ minWidth: 280 }}>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Form.Item
        label="使用者名稱"
        name="username"
        rules={[{ required: true, message: '請輸入使用者名稱' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="密碼"
        name="password"
        rules={[{ required: true, message: '請輸入密碼' }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          登入
        </Button>
      </Form.Item>
    </Form>
  );
}
