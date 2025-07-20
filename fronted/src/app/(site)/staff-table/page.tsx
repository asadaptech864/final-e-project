"use client";
import React, { useEffect, useState } from "react";
import HeroSub from "@/components/shared/HeroSub";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { useRole } from "@/hooks/useRole";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

const PAGE_SIZE = 10;

const roleLabel = (role: string) => {
  switch (role) {
    case 'receptionist': return 'Receptionist';
    case 'housekeeping': return 'Housekeeping';
    case 'manager': return 'Manager';
    case 'maintenance': return 'Maintenance';
    default: return role;
  }
};

export default function StaffTablePage() {
  const { isManager } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3001/users/allusers");
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users || []);
        } else {
          setError(data.message || "Failed to fetch users");
        }
      } catch (e) {
        setError("Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter out admin and guest
  const staffUsers = users.filter(u => u.role !== 'admin' && u.role !== 'guest');
  // Filter by search
  const filtered = staffUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 if search changes
  useEffect(() => { setPage(1); }, [search]);

  const handleDeactivate = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this staff member?")) return;
    try {
      const res = await fetch(`http://localhost:3001/deactivate/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false })
      });
      if (res.ok) {
        setUsers(users => users.map(u => u._id === id ? { ...u, isActive: false } : u));
      } else {
        alert("Failed to deactivate user");
      }
    } catch {
      alert("Error deactivating user");
    }
  };

  const handleActivate = async (id: string) => {
    if (!window.confirm("Are you sure you want to activate this staff member?")) return;
    try {
      const res = await fetch(`http://localhost:3001/activate/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true })
      });
      if (res.ok) {
        setUsers(users => users.map(u => u._id === id ? { ...u, isActive: true } : u));
      } else {
        alert("Failed to activate user");
      }
    } catch {
      alert("Error activating user");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) return;
    try {
      const res = await fetch(`http://localhost:3001/deleteuser/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers(users => users.filter(u => u._id !== id));
      } else {
        alert("Failed to delete user");
      }
    } catch {
      alert("Error deleting user");
    }
  };

  const handleEdit = (id: string) => {
    // Redirect to edit page (to be implemented)
    window.location.href = `/admin/users?id=${id}`;
  };

  if (loading) return <div>Loading staff...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <>
        <HeroSub
                title="Staff Profiles"
                description="View and manage your staff profiles."
                badge="Staff"
            />
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <input
          className="p-2 border rounded w-full max-w-xs"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <a
          href="http://localhost:3000/admin/users"
          className="bg-primary text-base font-semibold py-4 px-8 text-white hover:bg-white hover:text-dark duration-300 hover:cursor-pointer"
        style={{borderRadius: '10px', padding: '10px 20px'}}>
          Add Staff
        </a>
      </div>
      <table className="min-w-full border border-gray-200">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Role</th>
            <th className="px-4 py-2 border">Active</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((user) => (
            <tr key={user._id} className="hover:bg-gray-00">
              <td className="px-4 py-2 border">{user.name}</td>
              <td className="px-4 py-2 border">{user.email}</td>
              <td className="px-4 py-2 border">{roleLabel(user.role)}</td>
              <td className="px-4 py-2 border">{user.isActive ? 'Yes' : 'No'}</td>
              <td className="px-4 py-2 border">
                <div className="flex gap-1">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-white hover:text-dark border border-yellow-500 duration-300"
                    onClick={() => handleEdit(user._id)}
                    disabled={!user.isActive}
                  >
                    Edit
                  </button>
                  {user.isActive ? (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-white hover:text-red-600 border border-red-500 duration-300"
                      onClick={() => handleDeactivate(user._id)}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-white hover:text-green-600 border border-green-600 duration-300"
                      onClick={() => handleActivate(user._id)}
                    >
                      Activate
                    </button>
                  )}
                  <button
                    className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-white hover:text-gray-700 border border-gray-700 duration-300"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {paginated.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4">No staff found.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4">
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
    </>
    </ProtectedRoute>
  );
} 