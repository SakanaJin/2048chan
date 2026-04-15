type NotificationPayload = {
  type: "error" | "warning" | "info" | "success";
  title: string;
  content: string;
};

type Listener = (payload: NotificationPayload) => void;

let listener: Listener | null = null;

export const notificationEmitter = {
  emit: (payload: NotificationPayload) => {
    listener?.(payload);
  },
  subscribe: (fn: Listener) => {
    listener = fn;
    return () => {
      listener = null;
    };
  },
};
