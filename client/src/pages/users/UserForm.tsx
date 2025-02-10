import { Modal, Form, Input, Select, message } from "antd";
import { useMutation } from "@tanstack/react-query";
import type { User, InsertUser } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface UserFormProps {
  open: boolean;
  onCancel: () => void;
  user: User | null;
}

export default function UserForm({ open, onCancel, user }: UserFormProps) {
  const [form] = Form.useForm();

  const mutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      if (user) {
        await apiRequest("PATCH", `/api/users/${user.id}`, data);
      } else {
        await apiRequest("POST", "/api/users", data);
      }
    },
    onSuccess: () => {
      message.success(`User ${user ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      onCancel();
      form.resetFields();
    },
    onError: () => {
      message.error(`Failed to ${user ? "update" : "create"} user`);
    },
  });

  return (
    <Modal
      open={open}
      title={user ? "Edit User" : "Add User"}
      okText={user ? "Update" : "Create"}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={mutation.isPending}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={user || {}}
        onFinish={(values) => mutation.mutate(values)}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please input the name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input the email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Please select a role" }]}
        >
          <Select>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="manager">Manager</Select.Option>
            <Select.Option value="user">User</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select a status" }]}
        >
          <Select>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
            <Select.Option value="pending">Pending</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
