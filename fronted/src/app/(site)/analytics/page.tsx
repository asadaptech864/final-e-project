"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRole } from "@/hooks/useRole";
import { Icon } from '@iconify/react';

type AnalyticsData = {
  roomStatus: {
    total: number;
    occupied: number;
    vacant: number;
    maintenance: number;
    reserved: number;
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
};

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
      <div className="container mx-auto max-w-7xl px-5 2xl:px-0">
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
                  {/* Vacant */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="8"
                    strokeDasharray={`${(analyticsData.roomStatus.vacant / analyticsData.roomStatus.total) * 251.2} 251.2`}
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
                    strokeDashoffset={`-${((analyticsData.roomStatus.occupied + analyticsData.roomStatus.vacant) / analyticsData.roomStatus.total) * 251.2}`}
                    transform="rotate(-90 50 50)"
                  />
                  {/* Reserved */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="8"
                    strokeDasharray={`${(analyticsData.roomStatus.reserved / analyticsData.roomStatus.total) * 251.2} 251.2`}
                    strokeDashoffset={`-${((analyticsData.roomStatus.occupied + analyticsData.roomStatus.vacant + analyticsData.roomStatus.maintenance) / analyticsData.roomStatus.total) * 251.2}`}
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
                    <span className="text-gray-600 dark:text-gray-400">Vacant</span>
                  </div>
                  <span className="font-semibold text-dark dark:text-white">{analyticsData.roomStatus.vacant}</span>
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
                    <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Reserved</span>
                  </div>
                  <span className="font-semibold text-dark dark:text-white">{analyticsData.roomStatus.reserved}</span>
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
            <button className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <Icon icon="ph:file-pdf" className="text-red-500 mr-2" />
              Export PDF
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <Icon icon="ph:chart-line" className="text-blue-500 mr-2" />
              Generate Report
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <Icon icon="ph:gear" className="text-gray-500 mr-2" />
              Settings
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <Icon icon="ph:refresh" className="text-green-500 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 