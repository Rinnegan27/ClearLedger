export type NotificationType =
  | "missed_call"
  | "booking"
  | "campaign_alert"
  | "sync_failure";

export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface SSEMessage {
  type: "connected" | "notification" | "ping";
  notification?: NotificationData;
}

export type SSEController = ReadableStreamDefaultController<Uint8Array>;
