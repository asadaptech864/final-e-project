"use client"
import React, { useState } from 'react';
import HeroSub from "@/components/shared/HeroSub";

const roles = [
  { value: '', label: 'Select Role' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'manager', label: 'Manager' },
  { value: 'maintenance', label: 'Maintenance' },
];

export default function CreateStaffPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: roles[0].value,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3001/signup/adduser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage('Staff profile created successfully!');
        setForm({
          name: '',
          email: '',
          password: '',
          role: roles[0].value,
          isActive: true,
        });
      } else {
        const data = await res.json();
        setMessage(data.message || 'Failed to create staff profile.');
      }
    } catch (err) {
      setMessage('Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeroSub
                title="Create Staff Profile"
                description="Create a new staff profile for your hotel."
                badge="Staff"
            />
    <div className="max-w-xl mx-auto p-6 rounded shadow mb-5">
      <h1 className="text-2xl font-bold mb-4">Create Staff Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium ">Role</label>
          <select
            name="role"
            required
            value={form.role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded bg-gray-100 dark:bg-gray-800"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="font-medium">Active</label>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Staff'}
        </button>
        {message && (
          <div
            className={`mt-2 text-center text-sm ${/success/i.test(message) ? 'text-green-600' : 'text-red-600'}`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
    </>
  );
} 