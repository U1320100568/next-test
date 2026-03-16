'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Typography, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface UserRow {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const getToken = () => localStorage.getItem('adminAccessToken') || '';

  const fetchUsers = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?page=${p}&limit=10`, {
        headers: { authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setUsers(data.data);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(page); }, [page, fetchUsers]);

  const handleCreate = async (values: { username: string; email: string; password: string }) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json();
      messageApi.error(data.error || '建立失敗');
      return;
    }
    messageApi.success('使用者建立成功');
    setCreateOpen(false);
    form.resetFields();
    fetchUsers(1);
  };

  const handleUpdate = async (values: { email?: string; password?: string }) => {
    if (!editUser) return;
    const res = await fetch(`/api/users/${editUser.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json();
      messageApi.error(data.error || '更新失敗');
      return;
    }
    messageApi.success('使用者更新成功');
    setEditUser(null);
    fetchUsers(page);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
      messageApi.error('刪除失敗');
      return;
    }
    messageApi.success('使用者已刪除');
    fetchUsers(page);
  };

  const columns: ColumnsType<UserRow> = [
    { title: '使用者名稱', dataIndex: 'username', key: 'username' },
    { title: '電子郵件', dataIndex: 'email', key: 'email' },
    {
      title: '建立時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => new Date(v).toLocaleDateString('zh-TW'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => { setEditUser(record); form.setFieldsValue({ email: record.email }); }}
          >
            編輯
          </Button>
          <Popconfirm title="確定刪除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>刪除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>使用者管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          新增使用者
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showTotal: (t) => `共 ${t} 筆`,
        }}
      />
      <Modal
        title="新增使用者"
        open={createOpen}
        onCancel={() => { setCreateOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item label="使用者名稱" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="電子郵件" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="密碼" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="編輯使用者"
        open={!!editUser}
        onCancel={() => { setEditUser(null); form.resetFields(); }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item label="電子郵件" name="email" rules={[{ type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="新密碼（留空不修改）" name="password" rules={[{ min: 6 }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
