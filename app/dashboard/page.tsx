"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Phone, Calendar, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import useSWR from "swr";

// Warm color palette
const COLORS = ['#E07A5F', '#10B981', '#F59E0B', '#6B2737'];

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  // Date range state (default to last 30 days)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Fetch revenue data
  const { data: revenueData, error: revenueError, isLoading: revenueLoading } = useSWR(
    `/api/analytics/revenue?startDate=${startDate}&endDate=${endDate}`,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );

  // Calculate metrics from revenue data
  const metrics = {
    totalRevenue: revenueData?.summary?.totalRevenue || 0,
    totalSpend: revenueData?.summary?.totalSpend || 0,
    totalBookings: revenueData?.summary?.totalBookings || 0,
    costPerBooking: revenueData?.summary?.costPerBooking || 0,
    missedCalls: 0, // TODO: Fetch from calls API
  };

  // Transform channel data for charts
  const channelData = revenueData?.channels?.map((channel: any) => ({
    name: channel.channelName,
    value: channel.spend,
    bookings: channel.bookings,
    roi: Math.round(channel.roi),
    revenue: channel.revenue,
    profit: channel.profit,
    costPerBooking: channel.costPerBooking,
  })) || [];

  // Show loading state
  if (revenueLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (revenueError) {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-danger-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">Failed to load dashboard data</p>
            <p className="text-gray-600 text-sm">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />

      <div className="flex">
        {/* Filters Sidebar */}
        <aside className="w-72 bg-white p-6 min-h-screen border-r border-gray-200">
          <h2 className="font-heading text-lg font-bold mb-6 text-gray-900">Filters</h2>

          {/* Date Range */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block text-gray-600">Date Range</label>
            <Input
              type="date"
              className="mb-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Channel Filter */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block text-gray-600">Channel</label>
            <Select>
              <option>All Channels</option>
              <option>Google Ads</option>
              <option>Meta Ads</option>
              <option>Organic</option>
              <option>Referral</option>
            </Select>
          </div>

          {/* Campaign Type */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block text-gray-600">Campaign Type</label>
            <Select>
              <option>All Types</option>
              <option>Search</option>
              <option>Display</option>
              <option>Video</option>
              <option>Shopping</option>
            </Select>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block text-gray-600">Location</label>
            <Select>
              <option>All Locations</option>
              <option>North America</option>
              <option>Europe</option>
              <option>Asia</option>
            </Select>
          </div>

          {/* Device */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block text-gray-600">Device</label>
            <Select>
              <option>All Devices</option>
              <option>Desktop</option>
              <option>Mobile</option>
              <option>Tablet</option>
            </Select>
          </div>

          {/* Reset Button */}
          <Button className="w-full" variant="secondary">
            Reset Filters
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold mb-1.5 text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Track your marketing performance in real-time</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Cost Per Booking */}
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" accent>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Cost Per Booking</p>
                    <p className="text-2xl font-bold text-gray-900">${metrics.costPerBooking}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-coral-50">
                    <DollarSign className="w-4 h-4 text-coral-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="success" className="gap-1">
                    <TrendingDown className="w-3 h-3" />
                    8%
                  </Badge>
                  <span className="text-gray-600">vs. last month</span>
                </div>

                {/* Mini visual */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <svg className="w-full h-8" viewBox="0 0 200 30" preserveAspectRatio="none">
                    <path d="M 0 20 L 50 15 L 100 18 L 150 12 L 200 10" fill="none" stroke="#10B981" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </Card>

            {/* Total Revenue */}
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" accent>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-success-50">
                    <TrendingUp className="w-4 h-4 text-success-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="success" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    12%
                  </Badge>
                  <span className="text-gray-600">vs. last month</span>
                </div>

                {/* Mini progress bars */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-success-500 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">75%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Booked Jobs */}
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" accent>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Booked Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalBookings}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-burgundy-50">
                    <Calendar className="w-4 h-4 text-burgundy-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="success" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +5
                  </Badge>
                  <span className="text-gray-600">this month</span>
                </div>

                {/* Mini bar chart */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-end gap-1.5 h-8">
                  <div className="flex-1 bg-burgundy-600 rounded-t opacity-60" style={{height: '60%'}}></div>
                  <div className="flex-1 bg-burgundy-600 rounded-t opacity-80" style={{height: '80%'}}></div>
                  <div className="flex-1 bg-burgundy-600 rounded-t" style={{height: '100%'}}></div>
                  <div className="flex-1 bg-burgundy-600 rounded-t opacity-90" style={{height: '90%'}}></div>
                </div>
              </div>
            </Card>

            {/* Missed Calls */}
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" accent>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Missed Calls</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.missedCalls}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-danger-50">
                    <Phone className="w-4 h-4 text-danger-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="danger" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    $6,000
                  </Badge>
                  <span className="text-gray-600">est. lost revenue</span>
                </div>

                {/* Alert indicator */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-danger-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-danger-600">Needs attention</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {/* Revenue & Spend Chart - Shows summary only since we don't have time-series data yet */}
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" accent>
              <div className="p-5">
                <h3 className="font-heading text-base font-bold text-gray-900 mb-3">Revenue Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-coral-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Spend</p>
                      <p className="text-2xl font-bold text-gray-900">${metrics.totalSpend.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-coral-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-burgundy-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(metrics.totalRevenue - metrics.totalSpend).toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-burgundy-600" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Channel Distribution */}
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" accent>
              <div className="p-5">
                <h3 className="font-heading text-base font-bold text-gray-900 mb-3">Channel Distribution</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {channelData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E8E4E0',
                        borderRadius: '12px',
                        fontSize: '13px',
                        padding: '8px 12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                  {channelData.map((channel: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="text-gray-700 font-medium">{channel.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Channel Performance Table */}
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" accent>
            <div className="p-5">
              <h3 className="font-heading text-base font-bold text-gray-900 mb-3">Channel Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-3 text-sm font-bold text-gray-700">Channel</th>
                      <th className="text-right py-3 px-3 text-sm font-bold text-gray-700">Spend</th>
                      <th className="text-right py-3 px-3 text-sm font-bold text-gray-700">Bookings</th>
                      <th className="text-right py-3 px-3 text-sm font-bold text-gray-700">Cost/Booking</th>
                      <th className="text-right py-3 px-3 text-sm font-bold text-gray-700">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelData.map((channel: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index] }}></div>
                            <span className="font-semibold text-gray-900">{channel.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-gray-700 font-medium">
                          ${channel.value.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-700 font-medium">
                          {channel.bookings}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-700 font-medium">
                          ${channel.value > 0 ? (channel.value / channel.bookings).toFixed(2) : '0.00'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Badge variant="success">
                            {channel.roi}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
