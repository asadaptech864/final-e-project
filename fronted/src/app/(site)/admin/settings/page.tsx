"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRole } from "@/hooks/useRole";
import { Icon } from '@iconify/react';

type SystemSettings = {
  general: {
    hotelName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    timezone: string;
    currency: string;
  };
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    petPolicy: string;
    smokingPolicy: string;
    maxGuestsPerRoom: number;
  };
  taxes: {
    taxRate: number;
    serviceCharge: number;
    cityTax: number;
    stateTax: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    bookingAlerts: boolean;
    maintenanceAlerts: boolean;
    paymentAlerts: boolean;
  };
  roomRates: Array<{
    roomType: string;
    baseRate: number;
    weekendRate: number;
    holidayRate: number;
    seasonalRates: Array<{
      season: string;
      rate: number;
      startDate: string;
      endDate: string;
    }>;
  }>;
};

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type RoomType = {
  _id: string;
  name: string;
  description: string;
  image: string;
};

// NotificationSender Component
const NotificationSender = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({ type: '', text: '' });

  const roles = [
    { value: 'manager', label: 'Manager' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  // Fetch users when role changes
  useEffect(() => {
    if (selectedRole) {
      fetchUsersByRole(selectedRole);
    } else {
      setUsers([]);
      setSelectedUser('');
    }
  }, [selectedRole]);

  const fetchUsersByRole = async (role: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/users/role/${role}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");
      setUsers(data.users);
    } catch (e) {
      setNotificationMessage({ type: 'error', text: e instanceof Error ? e.message : "Error fetching users" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUser || !message.trim()) {
      setNotificationMessage({ type: 'error', text: 'Please select a user and enter a message' });
      return;
    }

    setSending(true);
    try {
      const res = await fetch('http://localhost:3001/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          message: message.trim(),
          type: 'admin',
          data: { role: selectedRole }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send notification");
      
      setNotificationMessage({ type: 'success', text: 'Notification sent successfully!' });
      setMessage('');
      setSelectedUser('');
    } catch (e) {
      setNotificationMessage({ type: 'error', text: e instanceof Error ? e.message : "Error sending notification" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 border-t pt-6">
      <h3 className="text-lg font-semibold text-dark dark:text-white">Send Notifications</h3>
      
      {/* Notification Message */}
      {notificationMessage.text && (
        <div className={`p-4 rounded-lg ${
          notificationMessage.type === 'success' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {notificationMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Choose a role...</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        {/* User Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={!selectedRole || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">
              {loading ? 'Loading users...' : selectedRole ? 'Choose a user...' : 'Select a role first'}
            </option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notification Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Enter your notification message here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Send Button */}
      <button
        onClick={handleSendNotification}
        disabled={sending || !selectedUser || !message.trim()}
        className="bg-primary text-white px-6 py-2 rounded-md hover:bg-dark transition disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send Notification'}
      </button>
    </div>
  );
};

export default function SystemSettingsPage() {
  const { data: session } = useSession();
  const { userRole } = useRole();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch room types for room rates management
  useEffect(() => {
    const fetchRoomTypes = async () => {
      setLoadingRoomTypes(true);
      try {
        const res = await fetch('http://localhost:3001/roomtypes/allroomtype');
        const data = await res.json();
        if (res.ok) {
          setRoomTypes(data.roomtype || []);
        }
      } catch (error) {
        console.error('Error fetching room types:', error);
      } finally {
        setLoadingRoomTypes(false);
      }
    };

    if (activeTab === 'roomRates') {
      fetchRoomTypes();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!session?.user) return;
    
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/admin/settings`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch settings");
        setSettings(data);
      } catch (e) {
        setMessage({ type: 'error', text: e instanceof Error ? e.message : "Error fetching settings" });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [session?.user]);

  const handleSave = async (section: string, data: any) => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3001/admin/settings/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save settings");
      
      setMessage({ type: 'success', text: `${section} settings saved successfully!` });
      setSettings(prev => prev ? { ...prev, [section]: data } : null);
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : "Error saving settings" });
    } finally {
      setSaving(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Please sign in to access system settings.
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Access denied. Only administrators can access system settings.
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

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">No settings data available.</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <section className="!pt-44 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-7xl px-5 2xl:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-dark dark:text-white">System Administration</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage system settings, policies, and configurations</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'general', label: 'General Settings', icon: 'ph:gear' },
                { id: 'policies', label: 'Hotel Policies', icon: 'ph:file-text' },
                { id: 'taxes', label: 'Taxes & Charges', icon: 'ph:calculator' },
                { id: 'roomRates', label: 'Room Rates', icon: 'ph:currency-dollar' },
                { id: 'notifications', label: 'Notifications', icon: 'ph:bell' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon icon={tab.icon} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-dark dark:text-white">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hotel Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.hotelName}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        general: { ...prev.general, hotelName: e.target.value }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        general: { ...prev.general, contactEmail: e.target.value }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.general.contactPhone}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        general: { ...prev.general, contactPhone: e.target.value }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        general: { ...prev.general, currency: e.target.value }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={settings.general.address}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      general: { ...prev.general, address: e.target.value }
                    } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={() => handleSave('general', settings.general)}
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-dark transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save General Settings'}
                </button>
              </div>
            )}

            {/* Hotel Policies */}
            {activeTab === 'policies' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-dark dark:text-white">Hotel Policies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Check-in Time
                    </label>
                    <input
                      type="time"
                      value={settings.policies.checkInTime}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        policies: { ...prev.policies, checkInTime: e.target.value }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Check-out Time
                    </label>
                    <input
                      type="time"
                      value={settings.policies.checkOutTime}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        policies: { ...prev.policies, checkOutTime: e.target.value }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Guests Per Room
                    </label>
                    <input
                      type="number"
                      value={settings.policies.maxGuestsPerRoom}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        policies: { ...prev.policies, maxGuestsPerRoom: parseInt(e.target.value) }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cancellation Policy
                    </label>
                    <textarea
                      value={settings.policies.cancellationPolicy}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        policies: { ...prev.policies, cancellationPolicy: e.target.value }
                      } : null)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pet Policy
                    </label>
                    <textarea
                      value={settings.policies.petPolicy}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        policies: { ...prev.policies, petPolicy: e.target.value }
                      } : null)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Smoking Policy
                    </label>
                    <textarea
                      value={settings.policies.smokingPolicy}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        policies: { ...prev.policies, smokingPolicy: e.target.value }
                      } : null)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleSave('policies', settings.policies)}
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-dark transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Policies'}
                </button>
              </div>
            )}

            {/* Taxes & Charges */}
            {activeTab === 'taxes' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-dark dark:text-white">Taxes & Charges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.taxes.taxRate}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        taxes: { ...prev.taxes, taxRate: parseFloat(e.target.value) }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Charge (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.taxes.serviceCharge}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        taxes: { ...prev.taxes, serviceCharge: parseFloat(e.target.value) }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City Tax (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.taxes.cityTax}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        taxes: { ...prev.taxes, cityTax: parseFloat(e.target.value) }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State Tax (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.taxes.stateTax}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        taxes: { ...prev.taxes, stateTax: parseFloat(e.target.value) }
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleSave('taxes', settings.taxes)}
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-dark transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Tax Settings'}
                </button>
              </div>
            )}

            {/* Room Rates */}
            {activeTab === 'roomRates' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-dark dark:text-white">Room Rates Management</h2>
                
                {loadingRoomTypes ? (
                  <div className="text-center py-4">Loading room types...</div>
                ) : roomTypes.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No room types found. Please add room types first.</div>
                ) : (
                  <div className="space-y-6">
                    {roomTypes.map((roomType) => {
                      // Find existing rate for this room type
                      const existingRate = settings?.roomRates.find(rate => rate.roomType === roomType.name);
                      
                      return (
                        <div key={roomType._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          <div className="flex items-center gap-4 mb-4">
                            {roomType.image && (
                              <img 
                                src={roomType.image} 
                                alt={roomType.name} 
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-dark dark:text-white">{roomType.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{roomType.description}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Base Rate ({settings?.general.currency || 'USD'})
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={existingRate?.baseRate || 0}
                                onChange={(e) => {
                                  const newRates = [...(settings?.roomRates || [])];
                                  const rateIndex = newRates.findIndex(rate => rate.roomType === roomType.name);
                                  
                                  if (rateIndex >= 0) {
                                    newRates[rateIndex].baseRate = parseFloat(e.target.value) || 0;
                                  } else {
                                    newRates.push({
                                      roomType: roomType.name,
                                      baseRate: parseFloat(e.target.value) || 0,
                                      weekendRate: 0,
                                      holidayRate: 0,
                                      seasonalRates: []
                                    });
                                  }
                                  
                                  setSettings(prev => prev ? { ...prev, roomRates: newRates } : null);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Weekend Rate ({settings?.general.currency || 'USD'})
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={existingRate?.weekendRate || 0}
                                onChange={(e) => {
                                  const newRates = [...(settings?.roomRates || [])];
                                  const rateIndex = newRates.findIndex(rate => rate.roomType === roomType.name);
                                  
                                  if (rateIndex >= 0) {
                                    newRates[rateIndex].weekendRate = parseFloat(e.target.value) || 0;
                                  } else {
                                    newRates.push({
                                      roomType: roomType.name,
                                      baseRate: 0,
                                      weekendRate: parseFloat(e.target.value) || 0,
                                      holidayRate: 0,
                                      seasonalRates: []
                                    });
                                  }
                                  
                                  setSettings(prev => prev ? { ...prev, roomRates: newRates } : null);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Holiday Rate ({settings?.general.currency || 'USD'})
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={existingRate?.holidayRate || 0}
                                onChange={(e) => {
                                  const newRates = [...(settings?.roomRates || [])];
                                  const rateIndex = newRates.findIndex(rate => rate.roomType === roomType.name);
                                  
                                  if (rateIndex >= 0) {
                                    newRates[rateIndex].holidayRate = parseFloat(e.target.value) || 0;
                                  } else {
                                    newRates.push({
                                      roomType: roomType.name,
                                      baseRate: 0,
                                      weekendRate: 0,
                                      holidayRate: parseFloat(e.target.value) || 0,
                                      seasonalRates: []
                                    });
                                  }
                                  
                                  setSettings(prev => prev ? { ...prev, roomRates: newRates } : null);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <button
                  onClick={() => handleSave('roomRates', settings?.roomRates || [])}
                  disabled={saving || roomTypes.length === 0}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-dark transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Room Rates'}
                </button>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-dark dark:text-white">System Notifications</h2>
                
                {/* Notification Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-dark dark:text-white">Notification Settings</h3>
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Send notifications via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Send notifications via SMS' },
                    { key: 'bookingAlerts', label: 'Booking Alerts', description: 'Alert staff about new bookings' },
                    { key: 'maintenanceAlerts', label: 'Maintenance Alerts', description: 'Alert staff about maintenance requests' },
                    { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Alert staff about payment issues' }
                  ].map((notification) => (
                    <div key={notification.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-dark dark:text-white">{notification.label}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{notification.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications[notification.key as keyof typeof settings.notifications] as boolean}
                          onChange={(e) => setSettings(prev => prev ? {
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              [notification.key]: e.target.checked
                            }
                          } : null)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleSave('notifications', settings.notifications)}
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-dark transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Notification Settings'}
                </button>

                {/* Send Notifications */}
                <NotificationSender />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 