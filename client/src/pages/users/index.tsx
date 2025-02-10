import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, Button, Space, Popconfirm, Tag, message } from "antd";
import { EditOutlined, DeleteOutlined, UserAddOutlined } from "@ant-design/icons";
import { useState } from "react";
import UserForm from "./UserForm";
import type { User } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function UsersPage() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      message.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      message.error("Failed to delete user");
    },
  });

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
            onConfirm={() => deleteMutation.mutate(record.id)}
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
        loading={isLoading}
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
