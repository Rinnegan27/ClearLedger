import prisma from "@/lib/db";
import { ConnectionManager } from "@/lib/sse/connection-manager";
import { NotificationType } from "@/lib/sse/types";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

/**
 * Create a notification and send it via SSE to connected clients
 */
export async function createNotification(input: CreateNotificationInput) {
  const { userId, type, title, message, data } = input;

  // Save to database
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : null,
    },
  });

  // Send via SSE to connected clients
  ConnectionManager.sendToUser(userId, {
    type: "notification",
    notification: {
      ...notification,
      data: notification.data ? JSON.parse(notification.data) : null,
    },
  });

  return notification;
}

/**
 * Create multiple notifications at once
 */
export async function createNotifications(inputs: CreateNotificationInput[]) {
  const notifications = await Promise.all(
    inputs.map((input) => createNotification(input))
  );

  return notifications;
}
