'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import { UserOutlined, DashboardOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Sider, Content, Header } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminName, setAdminName] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token && pathname !== '/admin/login') {
      router.replace('/admin/login');
      return;
    }
    const info = localStorage.getItem('adminInfo');
    if (info) setAdminName(JSON.parse(info).username);
  }, [pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;

  const logout = () => {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminInfo');
    router.push('/admin/login');
  };

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: '儀表板' },
    { key: '/admin/users', icon: <UserOutlined />, label: '使用者管理' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ color: 'white', padding: '16px', fontSize: '18px', fontWeight: 'bold' }}>
          管理後台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 16,
        }}>
          {adminName && <span>歡迎，{adminName}</span>}
          <Button icon={<LogoutOutlined />} onClick={logout}>登出</Button>
        </Header>
        <Content style={{ padding: 24, background: '#f0f2f5' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
