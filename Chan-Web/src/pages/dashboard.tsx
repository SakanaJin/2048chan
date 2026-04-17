import { Flex, Typography } from "antd";

export const DashboardPage = () => {
  const { Title } = Typography;
  return (
    <Flex justify="center" align="center" vertical style={{ height: "100%" }}>
      <Title>This the Dashboard!</Title>
    </Flex>
  );
};
