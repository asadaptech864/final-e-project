"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import HeroSub from "@/components/shared/HeroSub";

type Contact = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  userId: string | null;
  userInfo: {
    name: string;
    email: string;
    role: string;
  } | null;
  status: 'pending' | 'replied' | 'closed';
  adminReply: {
    message: string;
    repliedAt: string;
    repliedBy: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminContactsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (session && session.user?.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      router.push('/');
    }
  }, [session, router]);

  const fetchContacts = async () => {
    try {
      const response = await fetch('http://localhost:3001/contact/all');
      const data = await response.json();
      
      if (response.ok) {
        setContacts(data.contacts);
      } else {
        toast.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchContacts();
    }
  }, [session]);

  const handleReply = async () => {
    if (!selectedContact || !replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setIsReplying(true);

    try {
      const response = await fetch(`http://localhost:3001/contact/${selectedContact._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          replyMessage: replyMessage.trim(),
          adminId: session?.user?.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Reply sent successfully!');
        setReplyMessage('');
        setSelectedContact(null);
        fetchContacts(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const updateContactStatus = async (contactId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:3001/contact/${contactId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Status updated successfully!');
        fetchContacts(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'replied':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (session?.user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <>
      <HeroSub
      title="Contacts"
      description="Manage and respond to customer contact queries"
      badge="Contacts"
    />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Contact Queries Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and respond to customer contact queries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  All Contact Queries ({contacts.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {contacts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No contact queries found
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact._id}
                      className={`p-6 cursor-pointer transition-colors ${
                        selectedContact?._id === contact._id
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {contact.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                              {contact.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {contact.email} • {contact.phone}
                          </p>
                          {contact.userInfo && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                              Registered User: {contact.userInfo.name} ({contact.userInfo.role})
                            </p>
                          )}
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {contact.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {formatDate(contact.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateContactStatus(contact._id, 'closed');
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Close query"
                          >
                            <Icon icon="ph:x-circle" width={20} height={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Contact Details & Reply */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedContact ? 'Contact Details' : 'Select a Contact'}
                </h2>
              </div>
              
              {selectedContact ? (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedContact.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {selectedContact.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {selectedContact.phone}
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Message:</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedContact.message}
                      </p>
                    </div>

                    {selectedContact.adminReply && selectedContact.adminReply.message && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Admin Reply:</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {selectedContact.adminReply.message}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          {formatDate(selectedContact.adminReply.repliedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedContact.status !== 'replied' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reply Message
                        </label>
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Type your reply here..."
                        />
                      </div>
                      
                      <button
                        onClick={handleReply}
                        disabled={isReplying || !replyMessage.trim()}
                        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isReplying ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  Select a contact query to view details and send a reply
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
    </ProtectedRoute>
  );
} 