'use client';

import React, { useState } from 'react';
import { Button, Modal, Space } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useUserAuth } from './UserAuthProvider';
import LoginForm from './LoginForm';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  background: #001529;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
`;

const Logo = styled.div`
  color: white;
  font-size: 20px;
  font-weight: bold;
`;

export default function SiteHeader() {
  const { user, logout } = useUserAuth();
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <HeaderWrapper>
      <Logo>Next Test App</Logo>
      <Space>
        {user ? (
          <>
            <Button
              type="link"
              icon={<UserOutlined />}
              style={{ color: 'white' }}
              onClick={() => router.push('/profile')}
            >
              {user.username}
            </Button>
            <Button
              type="default"
              icon={<LogoutOutlined />}
              onClick={logout}
            >
              登出
            </Button>
          </>
        ) : (
          <Button type="primary" onClick={() => setLoginOpen(true)}>
            登入
          </Button>
        )}
      </Space>
      <Modal
        title="使用者登入"
        open={loginOpen}
        onCancel={() => setLoginOpen(false)}
        footer={null}
        destroyOnClose
      >
        <LoginForm onSuccess={() => setLoginOpen(false)} />
      </Modal>
    </HeaderWrapper>
  );
}
