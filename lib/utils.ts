import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function calculateCostPerBooking(spend: number, bookings: number): number {
  return bookings > 0 ? spend / bookings : 0;
}

export function calculateROI(revenue: number, cost: number): number {
  return cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
}
