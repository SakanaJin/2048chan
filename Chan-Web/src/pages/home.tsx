import { Avatar, Flex, Typography } from "antd";
import { useUser } from "../authentication/use-auth";

export const HomePage = () => {
  const { Title } = Typography;
  const user = useUser();
  return (
    <Flex
      justify="center"
      align="center"
      orientation="vertical"
      style={{ height: "100vh" }}
    >
      <Title>This the home page!</Title>
      <Avatar shape="square" size={65}>
        <Avatar shape="square" size={64} src={user.pfp_path} />
      </Avatar>
    </Flex>
  );
};
