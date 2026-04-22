import { Card, Empty, Flex, Typography, Divider, Avatar, Button } from "antd";
import { WSType, type MessageGetDto, type ThreadShallowDto, type WSMessage } from "../constants/types";
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
    const { id } = useParams<{ id: string}>();
    const user = useUser();
    const wsRef = useRef<WSManager | null>(null);

    useEffect(() => {
        api.get<ThreadShallowDto>(`/threads/${id}`).then((res) => {
            if (!res?.data?.has_errors) setThread(res.data.data);
        });
    }, [id]);

    useEffect(() => {
        const ws = new WSManager(
            `${wsBaseUrl}/threads/${id}`,
            {
                [WSType.READY]: (msg) => setMessages(msg.data.messages),
                [WSType.PAGE]: (msg) => setMessages(msg.data.messages),
                [WSType.MESSAGE]: (msg) => setMessages((prev) => [...prev, msg.data]),
            },
            {}
        );
        wsRef.current = ws;

        ws.connect().then(() => {
            ws.send({
                Mtype: WSType.READY,
                data: true
            });
        });

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [id]);

    const createMessage = async () => {
        if (!messageContent.trim() || !wsRef.current) return;
        wsRef.current.send({
            Mtype: WSType.MESSAGE,
            data: { content: messageContent }
        });
        setMessageContent("");
    };

    if (!thread) return null;

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
            <Title level={2} style={{ marginBottom: 4}}>
                {thread.name}
            </Title>
            <Flex vertical gap={12}>
                {messages.length === 0 ? (
                    <>
                        <Card style={{ borderRadius: 10}}>
                            <Empty
                                description="No messages on this thread"
                            />
                        </Card>
                    </>
                ) : (
                    messages.map((msg) => (
                        <Card 
                            key={msg.id} 
                            style={{ borderRadius: 10}}
                            title={
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: "20%",
                                    gap: 12,
                                    marginTop: 15
                                }}>
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
                                    <Title 
                                        level={4}
                                        style={{ margin: 0}}
                                    >
                                        {msg.author.username} - {msg.createdat}
                                    </Title>
                                </div>
                            }
                        >
                            <Text>{msg.content}</Text>
                        </Card>
                    ))
                )}
                <Divider />
                        <Card
                            styles={{ header: { borderBottom: 'none' } }}
                            style={{ borderRadius: 10}}
                            title={
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: "20%",
                                    gap: 12,
                                    marginTop: 15
                                }}>
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
                                    <Title 
                                        level={4}
                                        style={{ margin: 0}}
                                    >
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
                        />
                        <div style={{display: "flex", justifyContent: "flex-end", marginTop: 6}}>
                            <Button type="primary" onClick={createMessage}>
                                Post
                            </Button>
                        </div>
                    </Card>
            </Flex>
        </div>

    );
};