import { Flex, Typography } from "antd";

export const HomePage = () => {
  const { Title } = Typography;
  return (
    <Flex
      justify="center"
      align="center"
      orientation="vertical"
      style={{ height: "100vh" }}
    >
      <Title>This the home page!</Title>
    </Flex>
  );
};
