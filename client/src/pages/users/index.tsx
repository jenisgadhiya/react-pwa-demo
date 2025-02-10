import { Table, Button, Space, Popconfirm, Tag } from "antd";
import { EditOutlined, DeleteOutlined, UserAddOutlined } from "@ant-design/icons";
import { useState } from "react";
import UserForm from "./UserForm";
import type { User } from "@shared/schema";
import { useUsers } from "@/lib/hooks/useUsers";
import { App } from "antd";

export default function UsersPage() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { users, loading, error, deleteUser } = useUsers();
  const { message } = App.useApp();

  if (error) {
    message.error("Failed to load users");
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success("User deleted successfully");
    } catch (error) {
      message.error("Failed to delete user");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: User, b: User) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "admin" ? "red" : role === "manager" ? "blue" : "green"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "success" : status === "inactive" ? "error" : "warning"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              setIsFormVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => {
            setEditingUser(null);
            setIsFormVisible(true);
          }}
        >
          Add User
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <UserForm
        open={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        user={editingUser}
      />
    </div>
  );
}