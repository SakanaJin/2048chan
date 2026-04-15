import { Button, Flex, Form, Input, Modal } from "antd";
import {
  type UserGetDto,
  type UserCreateDto,
  type LoginDto,
} from "../../constants/types";
import api from "../../config/axios";
import { useState } from "react";

interface UserCreateModalProps {
  open: boolean;
  onConfirm: (values: LoginDto) => void;
  onCancel: () => void;
}

export const UserCreateModal = ({
  open,
  onConfirm,
  onCancel,
}: UserCreateModalProps) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleSubmit = async (values: UserCreateDto) => {
    setConfirmLoading(true);
    const response = await api.post<UserGetDto>(`/users`, values);

    if (response.data.has_errors) {
      form.setFields(
        response.data.errors.map((error) => ({
          name: error.property,
          errors: [error.message],
        })),
      );
      setConfirmLoading(false);
    }

    if (response.data.data) {
      onConfirm(values as LoginDto);
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      width="20rem"
      title="Sign Up"
      centered
      open={open}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      footer={
        <Flex justify="space-between" style={{ marginBottom: "0.5rem" }}>
          <Button
            key="cancel"
            variant="outlined"
            onClick={() => handleCancel()}
          >
            Cancel
          </Button>
          <Button key="confirm" type="primary" onClick={() => form.submit()}>
            Confirm
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirm_password"
          label="Confirm Password"
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Passwords do not match");
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};
