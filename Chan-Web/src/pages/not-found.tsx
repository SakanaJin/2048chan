import { Flex, theme, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrow } from "@fortawesome/free-solid-svg-icons";

const { Title } = Typography;

export const NotFoundPage = () => {
  const { token } = theme.useToken();
  return (
    <Flex
      justify="center"
      align="center"
      orientation="vertical"
      style={{ height: "100%" }}
    >
      <Title>Nothing here bozo!</Title>
      <FontAwesomeIcon
        icon={faCrow}
        size="3x"
        style={{ color: token.colorText }}
      />
    </Flex>
  );
};
