// Type definitions for ClearLedger

export type ChannelType = string;
export type CallStatus = string;
export type BookingStatus = string;
export type IntegrationType = string;

export interface DashboardMetrics {
  totalSpend: number;
  totalRevenue: number;
  totalBookings: number;
  totalCalls: number;
  missedCalls: number;
  costPerBooking: number;
  roi: number;
  revenueFromMissedCalls: number;
}

export interface ChannelPerformance {
  channelId: string;
  channelName: string;
  channelType: ChannelType;
  spend: number;
  bookings: number;
  revenue: number;
  roi: number;
  costPerBooking: number;
}

export interface CallInsights {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  missedCallRate: number;
  estimatedLostRevenue: number;
  averageDuration: number;
}

export interface TrendData {
  date: string;
  spend: number;
  revenue: number;
  bookings: number;
  roi: number;
}

export interface WeeklyInsight {
  id: string;
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "danger";
  actionable: boolean;
  recommendation?: string;
}
