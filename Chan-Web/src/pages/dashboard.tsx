import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Row,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  ClockCircleOutlined,
  CompassOutlined,
  EyeOutlined,
  MessageOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../routes/RouteIndex";
import { useUser, useAuth } from "../authentication/use-auth";
import api from "../config/axios";
import type { ThreadShallowDto } from "../constants/types";
import { notificationEmitter } from "../context/notification-emitter";

const { Title, Text } = Typography;

function formatExpiry(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `Expires in ${hours}h`;
  return `Expires in ${Math.floor(hours / 24)}d`;
}

function isExpiringSoon(isoString: string): boolean {
  const diff = new Date(isoString).getTime() - Date.now();
  return diff > 0 && diff < 24 * 3_600_000;
}

const RecentMessagesPlaceholder = () => (
  <Flex vertical gap={8}>
    {[1, 2].map((i) => (
      <Flex
        key={i}
        gap={10}
        align="flex-start"
        style={{
          padding: "10px 12px",
          background: "rgba(0,0,0,0.02)",
          borderRadius: 8,
          border: "1px dashed #d9d9d9",
        }}
      >
        {/* Avatar placeholder */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#f0f0f0",
            flexShrink: 0,
          }}
        />
        <Flex vertical gap={4} style={{ flex: 1 }}>
          {/* Username + timestamp line */}
          <Flex gap={8} align="center">
            <div
              style={{
                width: 70,
                height: 10,
                borderRadius: 4,
                background: "#e8e8e8",
              }}
            />
            <div
              style={{
                width: 40,
                height: 10,
                borderRadius: 4,
                background: "#f0f0f0",
              }}
            />
          </Flex>
          {/* Message content lines */}
          <div
            style={{
              width: "90%",
              height: 10,
              borderRadius: 4,
              background: "#f0f0f0",
            }}
          />
          <div
            style={{
              width: "60%",
              height: 10,
              borderRadius: 4,
              background: "#f5f5f5",
            }}
          />
        </Flex>
      </Flex>
    ))}
    <Text
      type="secondary"
      style={{ fontSize: 11, textAlign: "center", marginTop: 2 }}
    >
      <MessageOutlined style={{ marginRight: 4 }} />
      Recent messages coming soon
    </Text>
  </Flex>
);

const ThreadCard = ({
  thread,
  onUnsubscribe,
  unsubscribing,
  isOwner,
}: {
  thread: ThreadShallowDto;
  onUnsubscribe: (id: number) => void;
  unsubscribing: boolean;
  isOwner: boolean;
}) => {
  const navigate = useNavigate();
  const expiring = isExpiringSoon(thread.expiresat.toString());

  return (
    <Card
      hoverable
      style={{
        borderRadius: 10,
        border: expiring ? "1px solid #ff7875" : undefined,
        height: "100%",
      }}
      styles={{ body: { display: "flex", flexDirection: "column", gap: 12 } }}
    >
      {/* Title row */}
      <Flex justify="space-between" align="flex-start" gap={8}>
        <Text
          strong
          style={{
            fontSize: 15,
            cursor: "pointer",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          onClick={() => navigate(`/thread/${thread.id}`)}
        >
          {thread.name}
        </Text>
        {expiring && (
          <Tag color="error" style={{ flexShrink: 0 }}>
            Expiring soon
          </Tag>
        )}
      </Flex>

      {/* Stats row */}
      <Flex gap={16}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <TeamOutlined style={{ marginRight: 4 }} />
          {thread.subscribers} subscribers
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <EyeOutlined style={{ marginRight: 4 }} />
          {thread.views} views
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {formatExpiry(thread.expiresat.toString())}
        </Text>
      </Flex>

      <Divider style={{ margin: "0" }} />

      {/* Recent messages placeholder */}
      <RecentMessagesPlaceholder />

      <Divider style={{ margin: "0" }} />

      {/* Actions */}
      <Flex gap={8}>
        <Button
          size="small"
          type="primary"
          onClick={() => navigate(`/thread/${thread.id}`)}
        >
          Open
        </Button>
        <Tooltip
          title={
            isOwner
              ? "Owners cannot unsubscribe from their own thread"
              : "You will stop seeing this thread on your dashboard"
          }
        >
          <Button
            size="small"
            danger
            disabled={isOwner}
            loading={unsubscribing}
            onClick={() => onUnsubscribe(thread.id)}
          >
            Unsubscribe
          </Button>
        </Tooltip>
      </Flex>
    </Card>
  );
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useUser();
  const { fetchCurrentUser } = useAuth();
  const [threads, setThreads] = useState<ThreadShallowDto[]>(
    user?.subbedthreads ?? [],
  );
  const [unsubscribingIds, setUnsubscribingIds] = useState<Set<number>>(
    new Set(),
  );

  const handleUnsubscribe = async (id: number) => {
    setUnsubscribingIds((prev) => new Set(prev).add(id));
    const res = await api.post(`/threads/${id}/unsubscribe`);
    if (!res?.data?.has_errors) {
      setThreads((prev) => prev.filter((t) => t.id !== id));
      fetchCurrentUser();
      notificationEmitter.emit({
        type: "success",
        title: "Unsubscribed",
        content: "You have been unsubscribed from the thread.",
      });
    }
    setUnsubscribingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <Flex
        justify="space-between"
        align="flex-end"
        wrap="wrap"
        gap={12}
        style={{ marginBottom: 24 }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard
          </Title>
          <Text type="secondary">
            {threads.length > 0
              ? `You're subscribed to ${threads.length} thread${threads.length !== 1 ? "s" : ""}.`
              : "You haven't subscribed to any threads yet."}
          </Text>
        </div>
      </Flex>

      {/* Grid */}
      {threads.length === 0 ? (
        <Card style={{ borderRadius: 10 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Flex vertical align="center" gap={6}>
                <Text style={{ fontSize: 15 }}>No subscribed threads yet.</Text>
                <Text type="secondary">
                  Browse topics to find threads that interest you.
                </Text>
              </Flex>
            }
          >
            <Button
              type="primary"
              icon={<CompassOutlined />}
              onClick={() => navigate(routes.topics)}
            >
              Browse Topics
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {threads.map((thread) => {
            const isOwner = user.ownedthreads.some((t) => t.id === thread.id);
            return (
              <Col key={thread.id} xs={24} sm={24} md={12} xl={8} xxl={6}>
                <ThreadCard
                  thread={thread}
                  onUnsubscribe={handleUnsubscribe}
                  unsubscribing={unsubscribingIds.has(thread.id)}
                  isOwner={isOwner}
                />
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};
