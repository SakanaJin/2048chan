import { notification } from "antd";
import { createContext, useContext, type ReactNode } from "react";

type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationContextValue {
  openNotification: (notification: Notification) => void;
}

interface Notification {
  type: NotificationType;
  title: string;
  content: string;
}

export const NotificationContext = createContext<NotificationContextValue>({
  openNotification: () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (notification: Notification) => {
    api[notification.type]({
      title: notification.title,
      description: notification.content,
    });
  };
  return (
    <NotificationContext.Provider value={{ openNotification }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
