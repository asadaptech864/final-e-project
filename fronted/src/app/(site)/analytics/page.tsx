"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRole } from "@/hooks/useRole";
import { Icon } from '@iconify/react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type AnalyticsData = {
  roomStatus: {
    total: number;
    occupied: number;
    available: number;
    maintenance: number;
    cleaning: number;
    clean: number;
    reserved: number;
    nonReserved: number;
  };
  staffInfo: Array<{
    role: string;
    count: number;
    active: number;
  }>;
  reservations: {
    total: number;
    pending: number;
    confirmed: number;
    checkedIn: number;
    checkedOut: number;
    cancelled: number;
  };
  revenue: {
    daily: number;
    monthly: number;
    yearly: number;
    trend: number;
  };
  monthlyData: Array<{
    month: string;
    revenue: number;
    occupancy: number;
  }>;
  maintenance: {
    total: number;
    daily: number;
    monthly: number;
    yearly: number;
    statusBreakdown: { [key: string]: number };
    assigned: number;
    unassigned: number;
    perUser: { [key: string]: { name: string; [key: string]: number | string } };
    monthlyData: Array<{ month: string; count: number }>;
  };
};

// Helper to force all color-related styles to safe values (no oklch)
function forceSafeColors(element: Element) {
  if (element.nodeType !== 1) return;
  const el = element as HTMLElement;
  const computed = window.getComputedStyle(el);
  const colorProps = [
    'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'
  ];
  colorProps.forEach(prop => {
    // @ts-ignore
    if (computed[prop] && computed[prop].includes('oklch')) {
      // @ts-ignore
      el.style[prop] = prop === 'backgroundColor' ? '#fff' : '#000';
    }
  });
  Array.from(el.children).forEach(forceSafeColors);
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const { userRole } = useRole();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user) return;
    
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/analytics`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch analytics");
        setAnalyticsData(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error fetching analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [session?.user]);

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Please sign in to view analytics.
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'manager') {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Access denied. Only managers and admins can view analytics.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">No analytics data available.</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <section className="!pt-44 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div id="analytics-content" className="container mx-auto max-w-7xl px-5 2xl:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-dark dark:text-white">Analytics & Reporting Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive insights for hotel management and operations</p>
        </div>

        {/* Room Status Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-dark dark:text-white">Room Status Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">Room Distribution</h3>
              <div className="relative w-64 h-64 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Occupied */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeDasharray={`${(analyticsData.roomStatus.occupied / analyticsData.roomStatus.total) * 251.2} 251.2`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                  {/* Available */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="8"
                    strokeDasharray={`${(analyticsData.roomStatus.available / analyticsData.roomStatus.total) * 251.2} 251.2`}
                    strokeDashoffset={`-${(analyticsData.roomStatus.occupied / analyticsData.roomStatus.total) * 251.2}`}
                    transform="rotate(-90 50 50)"
                  />
                  {/* Maintenance */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="8"
                    strokeDasharray={`${(analyticsData.roomStatus.maintenance / analyticsData.roomStatus.total) * 251.2} 251.2`}
                    strokeDashoffset={`-${((analyticsData.roomStatus.occupied + analyticsData.roomStatus.available) / analyticsData.roomStatus.total) * 251.2}`}
                    transform="rotate(-90 50 50)"
                  />
                  {/* Cleaning */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="8"
                    strokeDasharray={`${(analyticsData.roomStatus.cleaning / analyticsData.roomStatus.total) * 251.2} 251.2`}
                    strokeDashoffset={`-${((analyticsData.roomStatus.occupied + analyticsData.roomStatus.available + analyticsData.roomStatus.maintenance) / analyticsData.roomStatus.total) * 251.2}`}
                    transform="rotate(-90 50 50)"
                  />
                  {/* Clean */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="8"
                    strokeDasharray={`${(analyticsData.roomStatus.clean / analyticsData.roomStatus.total) * 251.2} 251.2`}
                    strokeDashoffset={`-${((analyticsData.roomStatus.occupied + analyticsData.roomStatus.available + analyticsData.roomStatus.maintenance + analyticsData.roomStatus.cleaning) / analyticsData.roomStatus.total) * 251.2}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-dark dark:text-white">{analyticsData.roomStatus.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Rooms</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col justify-center">
              <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">Room Status Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Occupied</span>
                  </div>
                  <span className="font-semibold text-dark dark:text-white">{analyticsData.roomStatus.occupied}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                  </div>
                  <span className="font-semibold text-dark dark:text-white">{analyticsData.roomStatus.available}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
                  </div>
                  <span className="font-semibold text-dark dark:text-white">{analyticsData.roomStatus.maintenance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Cleaning</span>
                  </div>
                  <span className="font-semibold text-dark dark:text-white">{analyticsData.roomStatus.cleaning}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Clean</span>
                  </div>
                  <span className="font-semibold text-dark dark:text-white">{analyticsData.roomStatus.clean}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reserved vs Non-Reserved Rooms */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-dark dark:text-white">Reservation Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reserved Rooms */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">Reserved Rooms</h3>
                <Icon icon="ph:calendar-check" className="text-purple-500 text-2xl" />
              </div>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                {analyticsData.roomStatus.reserved}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                Rooms with confirmed reservations for today
              </div>
              <div className="mt-4">
                <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${(analyticsData.roomStatus.reserved / analyticsData.roomStatus.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {((analyticsData.roomStatus.reserved / analyticsData.roomStatus.total) * 100).toFixed(1)}% of total rooms
                </div>
              </div>
            </div>

            {/* Non-Reserved Rooms */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">Non-Reserved Rooms</h3>
                <Icon icon="ph:calendar-x" className="text-green-500 text-2xl" />
              </div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">
                {analyticsData.roomStatus.nonReserved}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Rooms available for new reservations
              </div>
              <div className="mt-4">
                <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${(analyticsData.roomStatus.nonReserved / analyticsData.roomStatus.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {((analyticsData.roomStatus.nonReserved / analyticsData.roomStatus.total) * 100).toFixed(1)}% of total rooms
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-dark dark:text-white">Staff Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.staffInfo.map((staff, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-dark dark:text-white capitalize">{staff.role}</h3>
                  <Icon icon="ph:users" className="text-primary text-xl" />
                </div>
                <div className="text-2xl font-bold text-dark dark:text-white mb-1">{staff.count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {staff.active} active
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(staff.active / staff.count) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reservation Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-dark dark:text-white">Reservation Statistics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">Reservation Status</h3>
              <div className="space-y-4">
                {[
                  { label: 'Pending', value: analyticsData.reservations.pending, color: 'bg-yellow-500' },
                  { label: 'Confirmed', value: analyticsData.reservations.confirmed, color: 'bg-blue-500' },
                  { label: 'Checked In', value: analyticsData.reservations.checkedIn, color: 'bg-green-500' },
                  { label: 'Checked Out', value: analyticsData.reservations.checkedOut, color: 'bg-purple-500' },
                  { label: 'Cancelled', value: analyticsData.reservations.cancelled, color: 'bg-red-500' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                        <div 
                          className={`${item.color} h-4 rounded-full transition-all duration-300`}
                          style={{ width: `${(item.value / analyticsData.reservations.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right font-semibold text-dark dark:text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Cards */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analyticsData.reservations.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Reservations</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analyticsData.reservations.confirmed}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Confirmed</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{analyticsData.reservations.pending}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{analyticsData.reservations.cancelled}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cancelled</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-dark dark:text-white">Maintenance Analytics</h2>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analyticsData.maintenance.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analyticsData.maintenance.daily}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{analyticsData.maintenance.monthly}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analyticsData.maintenance.yearly}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">This Year</div>
            </div>
          </div>
          {/* Assigned vs Unassigned */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">Assigned vs Unassigned</h3>
              <div className="flex items-center space-x-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold mb-2">{analyticsData.maintenance.assigned}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Assigned</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-xl font-bold mb-2">{analyticsData.maintenance.unassigned}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unassigned</div>
                </div>
              </div>
            </div>
            {/* Status Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">Status Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(analyticsData.maintenance.statusBreakdown).map(([status, count], idx) => (
                  <div key={status} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400 capitalize">{status}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                        <div className="bg-primary h-4 rounded-full transition-all duration-300" style={{ width: `${(count / analyticsData.maintenance.total) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="w-12 text-right font-semibold text-dark dark:text-white">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Per-User Assignment Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">Maintenance Assigned to Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                    {Object.keys(analyticsData.maintenance.statusBreakdown).map(status => (
                      <th key={status} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{status}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(analyticsData.maintenance.perUser).map(([userId, userData]) => (
                    <tr key={userId}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-dark dark:text-white font-semibold">{userData.name}</td>
                      {Object.keys(analyticsData.maintenance.statusBreakdown).map(status => (
                        <td key={status} className="px-4 py-2 whitespace-nowrap text-sm text-dark dark:text-white">{userData[status] || 0}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Monthly Maintenance Trend Chart */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">Monthly Maintenance Trend</h3>
            <div className="h-48 flex items-end justify-between">
              {analyticsData.maintenance.monthlyData.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-orange-500 rounded-t w-6 mb-2"
                    style={{ height: `${(item.count / Math.max(...analyticsData.maintenance.monthlyData.map(r => r.count))) * 120}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-dark dark:text-white">Revenue Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Cards */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">Revenue Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(analyticsData.revenue.daily)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Daily Revenue</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(analyticsData.revenue.monthly)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(analyticsData.revenue.yearly)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Yearly Revenue</div>
                </div>
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">Monthly Revenue Trend</h3>
              <div className="h-48 flex items-end justify-between">
                {analyticsData.monthlyData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-primary rounded-t w-6 mb-2"
                      style={{ height: `${(item.revenue / Math.max(...analyticsData.monthlyData.map(r => r.revenue))) * 120}px` }}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-dark dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={async () => {
                try {
                  const element = document.getElementById('analytics-content');
                  if (!element) {
                    alert('Analytics content not found');
                    return;
                  }

                  console.log('Starting PDF generation...');
                  
                  // Create a clone of the element to avoid modifying the original
                  const clone = element.cloneNode(true) as HTMLElement;
                  clone.style.position = 'absolute';
                  clone.style.left = '-9999px';
                  clone.style.top = '0';
                  document.body.appendChild(clone);

                  // Force all colors to safe values
                  forceSafeColors(clone);

                  const canvas = await html2canvas(clone, {
                    scale: 1,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false
                  });

                  // Remove the clone
                  document.body.removeChild(clone);

                  console.log('Canvas created, converting to PDF...');

                  const imgData = canvas.toDataURL('image/png');
                  const pdf = new jsPDF('p', 'mm', 'a4');
                  const imgWidth = 210;
                  const pageHeight = 295;
                  const imgHeight = (canvas.height * imgWidth) / canvas.width;
                  let heightLeft = imgHeight;

                  let position = 0;

                  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                  heightLeft -= pageHeight;

                  while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                  }

                  console.log('PDF generated, saving...');
                  const fileName = `hotel-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
                  pdf.save(fileName);
                  console.log('PDF saved successfully');
                } catch (error) {
                  console.error('Error generating PDF:', error);
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                  console.error('Error details:', errorMessage);
                  alert(`Failed to generate PDF: ${errorMessage}`);
                }
              }} 
              className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Icon icon="ph:file-pdf" className="text-red-500 mr-2" />
              Export PDF
            </button>
            <button 
              onClick={() => {
                try {
                  // Create CSV content
                  const csvContent = [
                    // Headers
                    ['Hotel Analytics Report', ''],
                    ['Generated on', new Date().toLocaleDateString()],
                    [''],
                    ['Room Status Overview', ''],
                    ['Total Rooms', analyticsData.roomStatus.total],
                    ['Occupied', analyticsData.roomStatus.occupied],
                    ['Available', analyticsData.roomStatus.available],
                    ['Maintenance', analyticsData.roomStatus.maintenance],
                    ['Cleaning', analyticsData.roomStatus.cleaning],
                    ['Clean', analyticsData.roomStatus.clean],
                    ['Reserved', analyticsData.roomStatus.reserved],
                    ['Non-Reserved', analyticsData.roomStatus.nonReserved],
                    [''],
                    ['Maintenance Analytics', ''],
                    ['Total Requests', analyticsData.maintenance.total],
                    ['Today', analyticsData.maintenance.daily],
                    ['This Month', analyticsData.maintenance.monthly],
                    ['This Year', analyticsData.maintenance.yearly],
                    ['Assigned', analyticsData.maintenance.assigned],
                    ['Unassigned', analyticsData.maintenance.unassigned],
                    [''],
                    ['Maintenance Status Breakdown', ''],
                    ...Object.entries(analyticsData.maintenance.statusBreakdown).map(([status, count]) => [status, count]),
                    [''],
                    ['Reservation Statistics', ''],
                    ['Total Reservations', analyticsData.reservations.total],
                    ['Pending', analyticsData.reservations.pending],
                    ['Confirmed', analyticsData.reservations.confirmed],
                    ['Checked In', analyticsData.reservations.checkedIn],
                    ['Checked Out', analyticsData.reservations.checkedOut],
                    ['Cancelled', analyticsData.reservations.cancelled],
                    [''],
                    ['Revenue Analytics', ''],
                    ['Daily Revenue', `$${analyticsData.revenue.daily.toLocaleString()}`],
                    ['Monthly Revenue', `$${analyticsData.revenue.monthly.toLocaleString()}`],
                    ['Yearly Revenue', `$${analyticsData.revenue.yearly.toLocaleString()}`],
                    ['Revenue Trend', `${analyticsData.revenue.trend.toFixed(2)}%`],
                    [''],
                    ['Staff Information', ''],
                    ...analyticsData.staffInfo.map(staff => [staff.role, staff.count, staff.active]),
                    [''],
                    ['Monthly Data', ''],
                    ...analyticsData.monthlyData.map(item => [item.month, item.revenue, item.occupancy])
                  ].map(row => row.join(',')).join('\n');

                  // Create and download file
                  const element = document.createElement('a');
                  const file = new Blob([csvContent], { type: 'text/csv' });
                  element.href = URL.createObjectURL(file);
                  element.download = `hotel-analytics-${new Date().toISOString().split('T')[0]}.csv`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                } catch (error) {
                  console.error('Error generating Excel report:', error);
                  alert('Failed to generate Excel report. Please try again.');
                }
              }} 
              className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Icon icon="ph:chart-line" className="text-blue-500 mr-2" />
              Generate Report
            </button>
            <button 
              onClick={() => window.location.href = '/admin/settings'} 
              className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Icon icon="ph:gear" className="text-gray-500 mr-2" />
              Settings
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Icon icon="ph:refresh" className="text-green-500 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 