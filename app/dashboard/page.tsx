"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Phone, Calendar, AlertCircle } from "lucide-react";

// Sample data
const revenueData = [
  { name: 'Jan', revenue: 28000, spend: 8500 },
  { name: 'Feb', revenue: 32000, spend: 9200 },
  { name: 'Mar', revenue: 35000, spend: 10500 },
  { name: 'Apr', revenue: 38000, spend: 11000 },
  { name: 'May', revenue: 42000, spend: 11800 },
  { name: 'Jun', revenue: 45000, spend: 12500 },
];

const channelData = [
  { name: 'Google Ads', value: 5000, bookings: 15, roi: 260 },
  { name: 'Meta Ads', value: 3500, bookings: 12, roi: 314 },
  { name: 'Organic', value: 0, bookings: 6, roi: 999 },
  { name: 'Referral', value: 1000, bookings: 3, roi: 430 },
];

// Brand palette colors only
const COLORS = ['#FF682C', '#10B981', '#F59E0B', '#401D19'];

export default function DashboardPage() {
  const metrics = {
    totalRevenue: 45000,
    totalSpend: 12500,
    totalBookings: 36,
    costPerBooking: 347.22,
    missedCalls: 12,
  };

  return (
    <div className="min-h-screen" style={{background: '#F5F3F1'}}>
      <DashboardHeader />

      <div className="flex">
        {/* Filters Sidebar */}
        <aside className="w-72 bg-white p-6 min-h-screen" style={{borderRight: '1px solid #E5E5E5'}}>
          <h2 className="text-lg font-bold mb-6" style={{color: '#401D19'}}>Filters</h2>

          {/* Date Range */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{color: '#6B5B52'}}>Date Range</label>
            <input
              type="date"
              className="w-full px-3 py-2 mb-2 rounded-lg text-sm"
              style={{border: '1px solid #E5E5E5', color: '#401D19'}}
              defaultValue="2025-06-01"
            />
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{border: '1px solid #E5E5E5', color: '#401D19'}}
              defaultValue="2025-06-30"
            />
          </div>

          {/* Channel Filter */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{color: '#6B5B52'}}>Channel</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm" style={{border: '1px solid #E5E5E5', color: '#401D19'}}>
              <option>All Channels</option>
              <option>Google Ads</option>
              <option>Meta Ads</option>
              <option>Organic</option>
              <option>Referral</option>
            </select>
          </div>

          {/* Campaign Type */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{color: '#6B5B52'}}>Campaign Type</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm" style={{border: '1px solid #E5E5E5', color: '#401D19'}}>
              <option>All Types</option>
              <option>Search</option>
              <option>Display</option>
              <option>Video</option>
              <option>Shopping</option>
            </select>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{color: '#6B5B52'}}>Location</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm" style={{border: '1px solid #E5E5E5', color: '#401D19'}}>
              <option>All Locations</option>
              <option>North America</option>
              <option>Europe</option>
              <option>Asia</option>
            </select>
          </div>

          {/* Device */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{color: '#6B5B52'}}>Device</label>
            <select className="w-full px-3 py-2 rounded-lg text-sm" style={{border: '1px solid #E5E5E5', color: '#401D19'}}>
              <option>All Devices</option>
              <option>Desktop</option>
              <option>Mobile</option>
              <option>Tablet</option>
            </select>
          </div>

          {/* Reset Button */}
          <button className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90" style={{background: '#FF682C', color: 'white'}}>
            Reset Filters
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6 fade-in">
            <h1 className="text-3xl font-bold mb-1" style={{color: '#401D19'}}>Dashboard</h1>
            <p style={{color: '#6B5B52'}}>Track your marketing performance in real-time</p>
          </div>

        {/* Key Metrics Grid - Touching Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 mb-6">
          {/* Cost Per Booking */}
          <div className="bg-white p-6 transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg fade-in" style={{borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5', borderLeft: '1px solid #E5E5E5'}}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Cost Per Booking</p>
                <p className="text-3xl font-bold text-gray-900">${metrics.costPerBooking}</p>
              </div>
              <div className="w-10 h-10 rounded flex items-center justify-center" style={{background: 'rgba(255, 104, 44, 0.1)'}}>
                <DollarSign className="w-5 h-5" style={{color: '#FF682C'}} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold" style={{color: '#10B981'}}>
                <TrendingDown className="w-4 h-4" />
                8%
              </span>
              <span className="text-gray-600">vs. last month</span>
            </div>

            {/* Mini visual */}
            <div className="mt-4 pt-4" style={{borderTop: '1px solid #F0F0F0'}}>
              <svg className="w-full h-8" viewBox="0 0 200 30" preserveAspectRatio="none">
                <path d="M 0 20 L 50 15 L 100 18 L 150 12 L 200 10" fill="none" stroke="#10B981" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-6 transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg fade-in-1" style={{borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5', borderLeft: '1px solid #E5E5E5'}}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded flex items-center justify-center" style={{background: 'rgba(16, 185, 129, 0.1)'}}>
                <TrendingUp className="w-5 h-5" style={{color: '#10B981'}} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold" style={{color: '#10B981'}}>
                <TrendingUp className="w-4 h-4" />
                12%
              </span>
              <span className="text-gray-600">vs. last month</span>
            </div>

            {/* Mini progress bars */}
            <div className="mt-4 pt-4 space-y-2" style={{borderTop: '1px solid #F0F0F0'}}>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width: '75%', background: '#10B981'}}></div>
                </div>
                <span className="text-xs font-semibold text-gray-600">75%</span>
              </div>
            </div>
          </div>

          {/* Booked Jobs */}
          <div className="bg-white p-6 transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg fade-in-2" style={{borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5', borderLeft: '1px solid #E5E5E5'}}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Booked Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.totalBookings}</p>
              </div>
              <div className="w-10 h-10 rounded flex items-center justify-center" style={{background: 'rgba(64, 29, 25, 0.1)'}}>
                <Calendar className="w-5 h-5" style={{color: '#401D19'}} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold" style={{color: '#10B981'}}>
                <TrendingUp className="w-4 h-4" />
                +5
              </span>
              <span className="text-gray-600">this month</span>
            </div>

            {/* Mini bar chart */}
            <div className="mt-4 pt-4 flex items-end gap-1.5 h-8" style={{borderTop: '1px solid #F0F0F0'}}>
              <div className="flex-1 rounded-t" style={{height: '60%', background: '#401D19', opacity: 0.6}}></div>
              <div className="flex-1 rounded-t" style={{height: '80%', background: '#401D19', opacity: 0.8}}></div>
              <div className="flex-1 rounded-t" style={{height: '100%', background: '#401D19'}}></div>
              <div className="flex-1 rounded-t" style={{height: '90%', background: '#401D19', opacity: 0.9}}></div>
            </div>
          </div>

          {/* Missed Calls */}
          <div className="bg-white p-6 transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg fade-in-3" style={{border: '1px solid #E5E5E5'}}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Missed Calls</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.missedCalls}</p>
              </div>
              <div className="w-10 h-10 rounded flex items-center justify-center" style={{background: 'rgba(239, 68, 68, 0.1)'}}>
                <Phone className="w-5 h-5" style={{color: '#EF4444'}} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold" style={{color: '#EF4444'}}>
                <AlertCircle className="w-4 h-4" />
                $6,000
              </span>
              <span className="text-gray-600">est. lost revenue</span>
            </div>

            {/* Alert indicator */}
            <div className="mt-4 pt-4 flex items-center gap-2" style={{borderTop: '1px solid #F0F0F0'}}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{background: '#EF4444'}}></div>
              <span className="text-xs font-semibold" style={{color: '#EF4444'}}>Needs attention</span>
            </div>
          </div>
        </div>

        {/* Charts Row - Touching Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-6">
          {/* Revenue & Spend Chart */}
          <div className="bg-white p-6 transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg fade-in overflow-hidden" style={{borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5', borderLeft: '1px solid #E5E5E5', position: 'relative'}}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{background: 'linear-gradient(90deg, #10B981 0%, #FF682C 100%)'}}></div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue vs. Spend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF682C" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF682C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4E0" />
                <XAxis dataKey="name" stroke="#8C7B72" fontSize={12} />
                <YAxis stroke="#8C7B72" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E8E4E0',
                    borderRadius: '12px',
                    fontSize: '13px',
                    padding: '8px 12px'
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="spend" stroke="#FF682C" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Channel Distribution */}
          <div className="bg-white p-6 transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg fade-in-1 overflow-hidden" style={{border: '1px solid #E5E5E5', position: 'relative'}}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{background: 'linear-gradient(90deg, #FF682C 0%, #10B981 50%, #F59E0B 100%)'}}></div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Channel Distribution</h3>
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
                  {channelData.map((entry, index) => (
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
              {channelData.map((channel, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-gray-700 font-medium">{channel.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Performance Table */}
        <div className="bg-white p-6 transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg fade-in-2 overflow-hidden" style={{border: '1px solid #E5E5E5', position: 'relative'}}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{background: 'linear-gradient(90deg, #FF682C 0%, #10B981 33%, #F59E0B 66%, #401D19 100%)'}}></div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Channel Performance</h3>
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
                {channelData.map((channel, index) => (
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
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-sm" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10B981'}}>
                        {channel.roi}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
