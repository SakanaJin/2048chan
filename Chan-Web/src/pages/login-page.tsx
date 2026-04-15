import { Button, Card, Form, Input, Typography } from "antd";
import type { LoginDto } from "../constants/types";
import api from "../config/axios";

export const LoginPage = ({ fetchCurrentUser }: { fetchCurrentUser: any }) => {
  const [form] = Form.useForm();
  const { Title } = Typography;

  const onFinish = async (values: LoginDto) => {
    const response = await api.post(`/auth/login`, values);

    if (response.data?.has_errors) {
      const formerrors = response.data.errors.reduce((obj: any, err: any) => {
        obj["name"] = err.property;
        obj["errors"] = err.message;
        return obj;
      }, {});
      form.setFields(formerrors);
      return;
    }

    if (response.data?.data) {
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
      <Card style={{ width: 300 }}>
        <Title level={2}>Sign In</Title>
        <Form form={form} onFinish={onFinish} layout="vertical">
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
            <Button type="primary" htmlType="submit" block>
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
