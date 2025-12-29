"use client";

import { Phone, Calendar, AlertTriangle, AlertCircle, X } from "lucide-react";
import { NotificationData } from "@/lib/sse/types";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
  notification: NotificationData;
  compact?: boolean;
}

export function NotificationItem({ notification, compact = false }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case "missed_call":
        return <Phone className="h-5 w-5 text-danger-600" />;
      case "booking":
        return <Calendar className="h-5 w-5 text-success-600" />;
      case "campaign_alert":
        return <AlertTriangle className="h-5 w-5 text-warning-600" />;
      case "sync_failure":
        return <AlertCircle className="h-5 w-5 text-danger-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors",
          !notification.read && "bg-burgundy-50 hover:bg-burgundy-100"
        )}
        onClick={handleClick}
      >
        <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </p>
            {!notification.read && (
              <span className="flex-shrink-0 h-2 w-2 rounded-full bg-burgundy-600" />
            )}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border transition-colors",
        notification.read ? "bg-white border-gray-200" : "bg-burgundy-50 border-burgundy-200"
      )}
    >
      <div className="flex-shrink-0">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-semibold text-gray-900">
            {notification.title}
          </h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1"
            onClick={handleDelete}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsRead(notification.id)}
              className="h-auto p-0 text-xs text-burgundy-600 hover:text-burgundy-700"
            >
              Mark as read
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
