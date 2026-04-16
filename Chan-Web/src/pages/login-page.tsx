import { Button, Card, Divider, Form, Input, Typography } from "antd";
import type { LoginDto } from "../constants/types";
import api from "../config/axios";
import { useState } from "react";
import { UserCreateModal } from "../components/modals/user-create-modal";
import { notificationEmitter } from "../context/notification-emitter";

export const LoginPage = ({ fetchCurrentUser }: { fetchCurrentUser: any }) => {
  const [form] = Form.useForm();
  const { Title } = Typography;
  const [open, setOpen] = useState(false);

  const onFinish = async (values: LoginDto) => {
    const response = await api.post(`/auth/login`, values);

    if (response.data?.has_errors) {
      form.setFields(
        response.data.errors.map((error) => ({
          name: error.property,
          errors: [error.message],
        })),
      );
      return;
    }

    if (response.data?.data) {
      await fetchCurrentUser();
    }
  };

  const continueAsGuest = async () => {
    const response = await api.post<boolean>(`/auth/guest`);

    if (response.data.has_errors) {
      notificationEmitter.emit({
        type: "error",
        title: "Error",
        content: response.data.errors[0].message,
      });
    }

    if (response.data.data) {
      await fetchCurrentUser();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <UserCreateModal
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={(values) => onFinish(values)}
      />
      <Card style={{ width: 300 }}>
        <Title level={2}>Sign In</Title>
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true }]}
          >
            <Input placeholder="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ marginTop: "1rem" }}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>
        <Divider>or</Divider>
        <Button
          variant="outlined"
          block
          style={{ marginBottom: "1rem" }}
          onClick={() => setOpen(true)}
        >
          Sign Up
        </Button>
        <Button variant="outlined" block onClick={() => continueAsGuest()}>
          Continue as Guest
        </Button>
      </Card>
    </div>
  );
};
