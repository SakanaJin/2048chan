import { Card, Empty, Flex, Typography, Divider, Avatar, Button, Spin } from "antd";
import {
  WSType,
  type MessageGetDto,
  type PageDto,
  type PaginationDto,
  type ThreadShallowDto,
  type WSMessage,
} from "../constants/types";
import { useEffect, useRef, useState } from "react";
import api from "../config/axios";
import { useParams } from "react-router-dom";
import { useUser } from "../authentication/use-auth";
import TextArea from "antd/es/input/TextArea";
import { EnvVars } from "../config/env-vars";
import { WSManager } from "../config/websocket-manager";

const { Title, Text } = Typography;
const wsBaseUrl = EnvVars.wsBaseUrl;

export const ThreadsPage = () => {
  const [thread, setThread] = useState<ThreadShallowDto | null>(null);
  const [messages, setMessages] = useState<MessageGetDto[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const { id } = useParams<{ id: string }>();
  const user = useUser();
  const wsRef = useRef<WSManager | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const initialScroll = useRef(false);

  useEffect(() => {
    api.get<ThreadShallowDto>(`/threads/${id}`).then((res) => {
      if (!res?.data?.has_errors) setThread(res.data.data);
    });

    const ws = new WSManager(
      `${wsBaseUrl}/threads/${id}`,
      {
        [WSType.READY]: async (msg: WSMessage) => {
          const page: PageDto = msg.data;
          setMessages(page.messages as unknown as MessageGetDto[]);
          setPagination(page.pagination);
        },
        [WSType.PAGE]: async (msg: WSMessage) => {
          const page: PageDto = msg.data;
          const container = messagesContainerRef.current;
          const prevScrollHeight = container?.scrollHeight ?? 0;

          setMessages((prev) => [...(page.messages as unknown as MessageGetDto[]), ...prev]);
          setPagination(page.pagination);

          requestAnimationFrame(() => {
            if (container) {
              container.scrollTop = container.scrollHeight - prevScrollHeight;
            }
          });
        },
        [WSType.MESSAGE]: async (msg: WSMessage) => {
          setMessages((prev) => [...prev, msg.data]);
          requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          });
        },
      },
      {},
    );

    wsRef.current = ws;

    ws.connect().then(() => {
      ws.send({
        Mtype: WSType.READY,
        data: true,
      });
    });

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [id]);

  useEffect(() => {
    if (messages.length > 0 && pagination?.current_page === 1) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && !initialScroll.current) {
      initialScroll.current = true;
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "instant" });
      }, 50);
    }
  }, [messages]);

  useEffect(() => {
    initialScroll.current = false;
  }, [id]);

  const sendMessage = async () => {
    if (!wsRef.current) return;
    wsRef.current.send({
      Mtype: WSType.MESSAGE,
      data: { content: messageContent },
    });
    setMessageContent("");
  };

  const loadOlderMessages = async () => {
    if (loadingMore || !pagination?.has_more || !wsRef.current) return;
    setLoadingMore(true);

    wsRef.current.send({
      Mtype: WSType.PAGE,
      data: { page: pagination.current_page + 1 },
    });

    setLoadingMore(false);
  };

  const handleScroll = () => {
    if (messagesContainerRef.current?.scrollTop === 0) {
      loadOlderMessages();
    }
  };

  function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day:          "2-digit",
      hour:         "2-digit",
      minute:       "2-digit",
      second:       "2-digit",
      hour12:       false,
      timeZoneName: "short",
    }).format(new Date(dateStr));
  }

  if (!thread) return null;

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", paddingLeft: 20 }}>
      <Title 
        level={1} 
        style={{ 
          marginBottom: 12
        }}
      >
        {thread.name}
      </Title>
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          height: "65vh",
          width: "100%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          paddingRight: 20,
        }}
      >
        {loadingMore && (
          <div style={{textAlign: "center", padding: 8}}>
            <Spin size="small"/>
          </div>
        )}

        {!pagination?.has_more && messages.length > 0 && (
          <div style={{ textAlign: "center", padding: 5 }}>
            <Text type="secondary">Beginning of thread</Text>
          </div>
        )}

        {messages.length === 0 ? (
          <>
            <Card style={{ borderRadius: 10 }}>
              <Empty description="No messages on this thread" />
            </Card>
          </>
        ) : (
          messages.map((msg) => (
            <Card
              key={msg.id}
              style={{ borderRadius: 10}}
              styles={{ 
                header: { borderBottom: "none" }, 
                body:{ whiteSpace: "pre-line"}
              }}
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    gap: 12,
                    marginTop: 15,
                  }}
                >
                  <Avatar
                    shape="square"
                    style={{
                      width: "50px",
                      height: "auto",
                      aspectRatio: "1/1",
                    }}
                  >
                    <Avatar
                      shape="square"
                      src={msg.author.pfp_path}
                      style={{
                        flex: 1,
                        width: "45px",
                        height: "auto",
                        aspectRatio: "1/1",
                      }}
                    />
                  </Avatar>
                    <Text 
                      strong
                      style={{
                        fontSize: "120%",
                        margin: 0
                      }}
                    
                    >
                    {msg.author.username}
                    </Text>
                    <Text
                      style={{
                        marginLeft: "auto"
                      }}
                    >{formatDate(msg.createdat)}</Text>
                </div>
              }
            >
              <Text>{msg.content}</Text>
            </Card>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ paddingRight: 20}}>
        <Divider />
        <Card
          styles={{ header: { borderBottom: "none" } }}
          style={{ borderRadius: 10 }}
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "20%",
                gap: 12,
                marginTop: 15,
              }}
            >
              <Avatar
                shape="square"
                style={{
                  width: "50px",
                  height: "auto",
                  aspectRatio: "1/1",
                }}
              >
                <Avatar
                  shape="square"
                  src={user.pfp_path}
                  style={{
                    flex: 1,
                    width: "45px",
                    height: "auto",
                    aspectRatio: "1/1",
                  }}
                />
              </Avatar>
              <Title level={4} style={{ margin: 0 }}>
                {user.username}
              </Title>
            </div>
          }
        >
          <TextArea
            placeholder="Comment..."
            size="large"
            rows={4}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 6,
            }}
          >
            <Button 
              type="primary" 
              onClick={(e) => {
                sendMessage();
                e.currentTarget.blur();
              }}
              >
              Post
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
