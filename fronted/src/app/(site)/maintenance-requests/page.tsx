"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRole } from "@/hooks/useRole";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";

export default function MaintenanceRequestsTablePage() {
  const { data: session } = useSession();
  const { userRole } = useRole();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [maintenanceUsers, setMaintenanceUsers] = useState<any[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>("");

  // Move fetchRequests outside useEffect so it can be called after assignRequest and updateStatus
  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const role = userRole;
      const userId = session?.user?.id || "";
      const url = `http://localhost:3001/allRequestedMaintenance/all?role=${role}&userId=${userId}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log(data); // Debug: check the structure of the response
      if (!res.ok) throw new Error(data.message || "Failed to fetch maintenance requests");
      setRequests(data.allRequestedMaintenance || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error fetching maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole && session?.user?.id) {
      fetchRequests();
    }
  }, [userRole, session?.user?.id]);

  useEffect(() => {
    fetch('http://localhost:3001/maintenance/users')
      .then(res => res.json())
      .then(data => setMaintenanceUsers(data.users || []));
  }, []);

  const assignRequest = async (id: string, userId: string) => {
    if (!userId) return;
    await fetch(`http://localhost:3001/maintenance/requests/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    fetchRequests();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`http://localhost:3001/maintenance/requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    // Refresh data
    fetchRequests();
  };

  return (
    <ProtectedRoute allowedRoles={['guest', 'housekeeping', 'maintenance', 'admin', 'manager']}>
    <>
    <section className="!pt-44 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl px-5 2xl:px-0">
        <h1 className="text-3xl font-bold mb-8 text-dark dark:text-white text-center">Maintenance Requests</h1>
        {loading ? (
          <div className="text-center py-10 text-lg">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 font-medium py-10">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-dark/60 dark:text-white/60 py-10">No maintenance requests found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Request ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Type of Issue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Urgency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Allow Access</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Reported By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Created At</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map((req: any, idx: number) => (
                  <tr key={req._id || idx}>
                    <td className="px-4 py-3 whitespace-nowrap">{req._id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-dark dark:text-white">{req.room?.name || "-"}</div>
                      <div className="text-xs text-dark/60 dark:text-white/60">{req.room?.roomType || "-"}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{req.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{req.issueType}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{req.urgency}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{req.location}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{req.allowAccess ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{req.status}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{req.reportedBy?.name || req.reportedBy || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(req.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{req.assignedTo?.name || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {/* Assignment functionality for housekeeping, admin, and manager */}
                      {(userRole === 'housekeeping' || userRole === 'admin' || userRole === 'manager') && !req.assignedTo && (
                        assigningId === req._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedUser}
                              onChange={e => setSelectedUser(e.target.value)}
                              className="border rounded px-2 py-1"
                            >
                              <option value="">Select user</option>
                              {maintenanceUsers.map(user => (
                                <option key={user._id} value={user._id}>{user.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                assignRequest(req._id, selectedUser);
                                setAssigningId(null);
                                setSelectedUser("");
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded"
                              disabled={!selectedUser}
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => setAssigningId(null)}
                              className="px-2 py-1 bg-gray-300 text-dark rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningId(req._id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                          >
                            Assign to
                          </button>
                        )
                      )}
                      
                      {/* Show assignment status for housekeeping, admin, and manager */}
                      {(userRole === 'housekeeping' || userRole === 'admin' || userRole === 'manager') && req.assignedTo && (
                        <div className="text-sm">
                          <div className="font-medium">Assigned to: {req.assignedTo?.name}</div>
                          <div className="text-gray-600">Status: {req.status}</div>
                        </div>
                      )}
                      
                      {/* Maintenance staff can update status */}
                      {userRole === 'maintenance' && !req.assignedTo && (
                        assigningId === req._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedUser}
                              onChange={e => setSelectedUser(e.target.value)}
                              className="border rounded px-2 py-1"
                            >
                              <option value="">Select user</option>
                              {maintenanceUsers.map(user => (
                                <option key={user._id} value={user._id}>{user.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                assignRequest(req._id, selectedUser);
                                setAssigningId(null);
                                setSelectedUser("");
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded"
                              disabled={!selectedUser}
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => setAssigningId(null)}
                              className="px-2 py-1 bg-gray-300 text-dark rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningId(req._id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                          >
                            Assign to
                          </button>
                        )
                      )}
                      
                      {/* Status update for assigned maintenance staff */}
                      {userRole === 'maintenance' && req.assignedTo?._id === session?.user?.id && (
                        <select
                          value={req.status}
                          onChange={e => updateStatus(req._id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      )}
                      
                      {/* Guest view */}
                      {userRole === 'guest' && (
                        <div>
                          {req.assignedTo ? (
                            <>
                              <div>Assigned to: {req.assignedTo?.name}</div>
                              <div>Status: {req.status}</div>
                            </>
                          ) : (
                            <>
                              <div>Not assigned to maintenance yet</div>
                              <div>Status: {req.status}</div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
    </>
    </ProtectedRoute>
  );
} 