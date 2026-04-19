import { Avatar, Button, Flex, Layout, theme, Typography } from "antd";
import { useState, type ReactNode } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useAuth, useUser } from "../../authentication/use-auth";
import { useNavigate } from "react-router-dom";
import { routes } from "../../routes/RouteIndex";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(true);
  const { Header, Content, Sider } = Layout;
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { logout } = useAuth();
  const user = useUser();
  const { Title } = Typography;
  const navbarbtnwidth = "5rem";
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        collapsedWidth={0}
        style={{ background: colorBgContainer }}
      >
        <Flex vertical align="center">
          <Avatar
            shape="square"
            style={{
              marginTop: "2rem",
              flex: 1,
              width: "60%",
              height: "auto",
              aspectRatio: "1/1",
            }}
          >
            <Avatar
              shape="square"
              src={user.pfp_path}
              style={{
                flex: 1,
                width: "95%",
                height: "auto",
                aspectRatio: "1/1",
              }}
            />
          </Avatar>
          <Title
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.username}
          </Title>
          <Button
            danger
            block
            onClick={logout}
            style={{
              flex: 1,
              width: "95%",
              height: "auto",
              aspectRatio: "100/15",
              marginRight: "0.25rem",
            }}
          >
            Logout
          </Button>
        </Flex>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 32,
              height: 32,
              boxShadow: "none",
              marginRight: "1rem",
              marginLeft: "1rem",
            }}
          />
          <Title>2048chan</Title>
          <Button
            style={{ marginLeft: "1rem", width: navbarbtnwidth }}
            color="primary"
            variant="filled"
            onClick={() => navigate(routes.dashboard)}
          >
            Dashboard
          </Button>
          <Button
            style={{ marginLeft: "1rem", width: navbarbtnwidth }}
            color="primary"
            variant="filled"
            onClick={() => navigate(routes.topics)}
          >
            Topics
          </Button>
        </Header>
        <Content style={{ height: "100%" }}>{children}</Content>
      </Layout>
    </Layout>
  );
};
