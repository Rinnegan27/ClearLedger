"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/toast";
import { NotificationData, SSEMessage } from "@/lib/sse/types";

export function useNotifications() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch initial notifications
  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // SSE connection
  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connect = () => {
      try {
        eventSource = new EventSource("/api/notifications/stream");

        eventSource.onopen = () => {
          console.log("[SSE] Connected");
          setIsConnected(true);
          reconnectAttempts = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const message: SSEMessage = JSON.parse(event.data);

            if (message.type === "connected") {
              console.log("[SSE] Connection confirmed");
            } else if (message.type === "notification" && message.notification) {
              handleNewNotification(message.notification);
            }
          } catch (error) {
            console.error("[SSE] Failed to parse message:", error);
          }
        };

        eventSource.onerror = (error) => {
          console.error("[SSE] Connection error:", error);
          setIsConnected(false);

          if (eventSource) {
            eventSource.close();
          }

          // Exponential backoff for reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

            reconnectTimeout = setTimeout(() => {
              reconnectAttempts++;
              connect();
            }, delay);
          } else {
            console.error("[SSE] Max reconnection attempts reached");
            toast.error("Connection lost", "Please refresh the page to restore real-time notifications");
          }
        };
      } catch (error) {
        console.error("[SSE] Failed to create connection:", error);
      }
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      setIsConnected(false);
    };
  }, [status]);

  const handleNewNotification = useCallback((notification: NotificationData) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show toast notification
    const getToastVariant = (type: string) => {
      switch (type) {
        case "missed_call":
        case "sync_failure":
          return "error";
        case "campaign_alert":
          return "warning";
        case "booking":
          return "success";
        default:
          return "info";
      }
    };

    const variant = getToastVariant(notification.type);

    if (variant === "error") {
      toast.error(notification.title, notification.message);
    } else if (variant === "warning") {
      toast.warning(notification.title, notification.message);
    } else if (variant === "success") {
      toast.success(notification.title, notification.message);
    } else {
      toast.info(notification.title, notification.message);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
}
