import { useEffect } from "react";
import { notificationEmitter } from "./notification-emitter";
import { useNotification } from "./notification-provider";

export const NotificationBridge = () => {
  const { openNotification } = useNotification();

  useEffect(() => {
    const unsub = notificationEmitter.subscribe(openNotification);
    return unsub;
  }, [openNotification]);

  return null;
};
