import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Input,
  Row,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../config/axios";
import { useAuth, useUser } from "../authentication/use-auth";
import type { TopicGetDto, ThreadShallowDto } from "../constants/types";
import { notificationEmitter } from "../context/notification-emitter";

const { Title, Text } = Typography;

export const TopicsPage = () => {
  const user = useUser();
  const { fetchCurrentUser } = useAuth();
  const [topics, setTopics] = useState<TopicGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newThreadName, setNewThreadName] = useState<Record<number, string>>(
    {},
  );
  const [creating, setCreating] = useState<number | null>(null);
  const [subscribing, setSubscribing] = useState<number | null>(null);

  useEffect(() => {
    api.get<TopicGetDto[]>("/topics").then((res) => {
      if (!res?.data?.has_errors) setTopics(res.data.data);
      setLoading(false);
    });
  }, []);

  const isSubscribed = (threadId: number) =>
    user?.subbedthreads?.some((t: ThreadShallowDto) => t.id === threadId) ??
    false;

  const handleSubscribe = async (threadId: number) => {
    setSubscribing(threadId);
    const res = await api.post(`/threads/${threadId}/subscribe`);
    if (!res?.data?.has_errors) {
      notificationEmitter.emit({
        type: "success",
        title: "Subscribed",
        content: "You are now subscribed.",
      });
      fetchCurrentUser();
    }
    setSubscribing(null);
  };

  const handleUnsubscribe = async (threadId: number) => {
    setSubscribing(threadId);
    const res = await api.post(`/threads/${threadId}/unsubscribe`);
    if (!res?.data?.has_errors) {
      notificationEmitter.emit({
        type: "success",
        title: "Unsubscribed",
        content: "You have unsubscribed.",
      });
      fetchCurrentUser();
    }
    setSubscribing(null);
  };

  const handleCreate = async (topicId: number) => {
    const name = newThreadName[topicId]?.trim();
    if (!name) return;
    setCreating(topicId);
    const res = await api.post(`/threads/topic/${topicId}`, { name });
    if (!res?.data?.has_errors) {
      notificationEmitter.emit({
        type: "success",
        title: "Thread created",
        content: `"${name}" created and subscribed.`,
      });
      fetchCurrentUser();
      setNewThreadName((prev) => ({ ...prev, [topicId]: "" }));
    }
    setCreating(null);
  };

  if (loading) return <Skeleton active style={{ padding: 32 }} />;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: 4 }}>
        Topics
      </Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
        Subscribe to threads to see them on your dashboard.
      </Text>

      <Flex vertical gap={24}>
        {topics.map((topic) => (
          <Card key={topic.id} style={{ borderRadius: 10 }}>
            <Title level={4} style={{ margin: "0 0 16px" }}>
              {topic.name}
            </Title>

            {topic.threads.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No threads yet"
              />
            ) : (
              <Row gutter={[12, 12]}>
                {topic.threads.map((thread) => {
                  const subbed = isSubscribed(thread.id);
                  return (
                    <Col key={thread.id} xs={24} sm={12} md={8}>
                      <Card
                        size="small"
                        style={{
                          borderRadius: 8,
                          border: subbed ? "1px solid #185FA5" : undefined,
                        }}
                      >
                        <Flex vertical gap={8}>
                          <Flex justify="space-between" align="center" gap={8}>
                            <Text
                              strong
                              style={{
                                fontSize: 13,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {thread.name}
                            </Text>
                            {subbed && (
                              <Tag color="blue" style={{ fontSize: 11 }}>
                                Subscribed
                              </Tag>
                            )}
                          </Flex>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {thread.subscribers} subscribers · {thread.views}{" "}
                            views
                          </Text>
                          <Tooltip
                            title={
                              user.ownedthreads.some((t) => t.id === thread.id)
                                ? "Owners cannot unsubscribe from their own thread"
                                : ""
                            }
                          >
                            <Button
                              size="small"
                              type={subbed ? "default" : "primary"}
                              danger={subbed}
                              disabled={user.ownedthreads.some(
                                (t) => t.id === thread.id,
                              )}
                              loading={subscribing === thread.id}
                              onClick={() =>
                                subbed
                                  ? handleUnsubscribe(thread.id)
                                  : handleSubscribe(thread.id)
                              }
                            >
                              {subbed ? "Unsubscribe" : "Subscribe"}
                            </Button>
                          </Tooltip>
                        </Flex>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}

            <Divider style={{ margin: "16px 0" }} />

            <Flex gap={8}>
              <Input
                placeholder="New thread name..."
                size="small"
                value={newThreadName[topic.id] ?? ""}
                onChange={(e) =>
                  setNewThreadName((prev) => ({
                    ...prev,
                    [topic.id]: e.target.value,
                  }))
                }
                onPressEnter={() => handleCreate(topic.id)}
                style={{ maxWidth: 280 }}
              />
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                loading={creating === topic.id}
                onClick={() => handleCreate(topic.id)}
              >
                Create thread
              </Button>
            </Flex>
          </Card>
        ))}
      </Flex>
    </div>
  );
};
