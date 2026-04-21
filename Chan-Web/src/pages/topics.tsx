import { Button, Card, Flex, Skeleton, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import type { TopicShallowDto } from "../constants/types";

const { Title, Text } = Typography;

export const TopicsPage = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<TopicShallowDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<TopicShallowDto[]>("/topics").then((res) => {
      if (!res?.data?.has_errors) setTopics(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div style={{ padding: "28px 32px", maxWidth: 800, margin: "0 auto" }}>
        <Skeleton active />
      </div>
    );

  return (
    <div style={{ padding: "28px 32px", maxWidth: 800, margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: 4 }}>
        Topics
      </Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
        Browse topics and subscribe to threads to see them on your dashboard.
      </Text>

      <Flex vertical gap={12}>
        {topics.map((topic) => (
          <Card
            key={topic.id}
            style={{ borderRadius: 10 }}
            styles={{ body: { padding: "16px 20px" } }}
          >
            <Flex justify="space-between" align="center">
              <div>
                <Text strong style={{ fontSize: 15 }}>
                  {topic.name}
                </Text>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: 12, marginTop: 2 }}
                >
                  {topic.views} views
                </Text>
              </div>
              <Button
                type="primary"
                size="small"
                onClick={() => navigate(`/topic/${topic.id}`)}
              >
                View
              </Button>
            </Flex>
          </Card>
        ))}
      </Flex>
    </div>
  );
};
