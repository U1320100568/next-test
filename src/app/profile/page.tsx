'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Button, Alert, Descriptions } from 'antd';
import { useRouter } from 'next/navigation';
import { useUserAuth } from '@/components/UserAuthProvider';
import { UserAuthProvider } from '@/components/UserAuthProvider';
import SiteHeader from '@/components/SiteHeader';

const { Title } = Typography;

function ProfileContent() {
  const { user, accessToken, logout } = useUserAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) router.push('/');
  }, [user, router]);

  const onChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: '密碼修改成功，請重新登入' });
      setTimeout(() => { logout(); router.push('/'); }, 2000);
    } catch (e: unknown) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : '修改失敗' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
      <Title level={2}>歡迎回來，{user.username}！</Title>
      <Card title="使用者資訊" style={{ marginBottom: 24 }}>
        <Descriptions>
          <Descriptions.Item label="使用者名稱">{user.username}</Descriptions.Item>
          <Descriptions.Item label="電子郵件">{user.email}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="修改密碼">
        {message && (
          <Alert type={message.type} message={message.text} style={{ marginBottom: 16 }} />
        )}
        <Form layout="vertical" onFinish={onChangePassword} style={{ maxWidth: 400 }}>
          <Form.Item
            label="目前密碼"
            name="currentPassword"
            rules={[{ required: true, message: '請輸入目前密碼' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="新密碼"
            name="newPassword"
            rules={[{ required: true, min: 6, message: '新密碼至少 6 個字元' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="確認新密碼"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '請確認新密碼' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('兩次輸入的密碼不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              修改密碼
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <UserAuthProvider>
      <SiteHeader />
      <ProfileContent />
    </UserAuthProvider>
  );
}
