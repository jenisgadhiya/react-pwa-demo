import { Modal, Form, Input, Select } from "antd";
import type { User } from "@shared/schema";
import { useUsers } from "@/lib/hooks/useUsers";
import { App } from "antd";

interface UserFormProps {
  open: boolean;
  onCancel: () => void;
  user: User | null;
}

export default function UserForm({ open, onCancel, user }: UserFormProps) {
  const [form] = Form.useForm();
  const { createUser, updateUser } = useUsers();
  const { message } = App.useApp();

  const handleSubmit = async (values: any) => {
    try {
      if (user) {
        await updateUser(user.id, values);
        message.success("User updated successfully");
      } else {
        await createUser(values);
        message.success("User created successfully");
      }
      onCancel();
      form.resetFields();
    } catch (error) {
      message.error(`Failed to ${user ? "update" : "create"} user`);
    }
  };

  return (
    <Modal
      open={open}
      title={user ? "Edit User" : "Add User"}
      okText={user ? "Update" : "Create"}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={user || {}}
        onFinish={handleSubmit}
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