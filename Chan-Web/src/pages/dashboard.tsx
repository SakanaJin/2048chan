import {
  Avatar,
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
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../routes/RouteIndex";
import { useUser, useAuth } from "../authentication/use-auth";
import api from "../config/axios";
import type { MessageShallowDto, ThreadShallowDto } from "../constants/types";
import { notificationEmitter } from "../context/notification-emitter";

const { Title, Text } = Typography;

function formatExpiry(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `Expires in ${hours}h`;
  return `Expires in ${Math.floor(hours / 24)}d`;
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function isExpiringSoon(isoString: string): boolean {
  const diff = new Date(isoString).getTime() - Date.now();
  return diff > 0 && diff < 24 * 3_600_000;
}

const RecentMessages = ({ threadId }: { threadId: number }) => {
  const [messages, setMessages] = useState<MessageShallowDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<
        MessageShallowDto[]
      >(`/threads/${threadId}/messages?page=1&page_size=2`)
      .then((res) => {
        if (!res?.data?.has_errors) setMessages(res.data.data);
        setLoading(false);
      });
  }, [threadId]);

  if (loading) return <div style={{ height: 130 }} />;

  return (
    <div style={{ height: 130, overflow: "hidden" }}>
      {messages.length === 0 ? (
        <Flex align="center" justify="center" style={{ height: 130 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            No messages yet — be the first to post!
          </Text>
        </Flex>
      ) : (
        <Flex vertical gap={8}>
          {messages.map((msg) => (
            <Flex
              key={msg.id}
              gap={10}
              align="flex-start"
              style={{
                padding: "8px 10px",
                background: "rgba(0,0,0,0.02)",
                borderRadius: 8,
              }}
            >
              <Avatar
                size={28}
                src={msg.author.pfp_path || undefined}
                icon={!msg.author.pfp_path ? <UserOutlined /> : undefined}
                style={{ flexShrink: 0 }}
              />
              <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Flex gap={8} align="center">
                  <Text strong style={{ fontSize: 12 }}>
                    {msg.author.username}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {formatRelativeTime(msg.createdat.toString())}
                  </Text>
                </Flex>
                <Text
                  style={{ fontSize: 12, color: "#4a9e6b" }}
                  ellipsis={{ tooltip: msg.content }}
                >
                  {msg.content}
                </Text>
              </Flex>
            </Flex>
          ))}
        </Flex>
      )}
    </div>
  );
};

const ThreadCard = ({
  thread,
  onUnsubscribe,
  unsubscribing,
  isOwner,
  busy,
}: {
  thread: ThreadShallowDto;
  onUnsubscribe: (id: number) => void;
  unsubscribing: boolean;
  isOwner: boolean;
  busy: boolean;
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

      {/* Recent messages */}
      <RecentMessages threadId={thread.id} />

      <Divider style={{ margin: "0" }} />

      {/* Actions */}
      <Flex gap={8}>
        <Button
          size="small"
          type="primary"
          disabled={busy}
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
            disabled={isOwner || busy}
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
  const [busy, setBusy] = useState(false);

  const handleUnsubscribe = async (id: number) => {
    setBusy(true);
    setUnsubscribingIds((prev) => new Set(prev).add(id));
    const res = await api.post(`/threads/${id}/unsubscribe`);
    if (!res?.data?.has_errors) {
      setThreads((prev) => prev.filter((t) => t.id !== id));
      await fetchCurrentUser();
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
    setBusy(false);
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
                  busy={busy}
                />
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};
