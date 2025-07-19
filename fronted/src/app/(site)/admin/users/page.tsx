"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HeroSub from "@/components/shared/HeroSub";

const roles = [
  { value: '', label: 'Select Role' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'manager', label: 'Manager' },
  { value: 'maintenance', label: 'Maintenance' },
];

export default function CreateOrEditStaffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: roles[0].value,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      fetch(`http://localhost:3001/users/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setForm({
              name: data.user.name,
              email: data.user.email,
              password: '', // Don't prefill password
              role: data.user.role,
              isActive: data.user.isActive,
            });
          } else {
            setMessage(data.message || 'Failed to fetch user.');
          }
        })
        .catch(() => setMessage('Error fetching user.'))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

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
      let res, data;
      if (isEdit && id) {
        res = await fetch(`http://localhost:3001/users/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (res.ok) {
          setMessage('Staff profile updated successfully!');
          router.push('/staff-table');
        } else {
          setMessage(data.message || 'Failed to update staff profile.');
        }
      } else {
        res = await fetch('http://localhost:3001/signup/adduser', {
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
          router.push('/staff-table');
        } else {
          data = await res.json();
          setMessage(data.message || 'Failed to create staff profile.');
        }
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
        title={isEdit ? 'Edit Staff Profile' : 'Create Staff Profile'}
        description={isEdit ? 'Edit an existing staff profile.' : 'Create a new staff profile for your hotel.'}
        badge="Staff"
      />
      <div className="max-w-xl mx-auto p-6 rounded shadow mb-5">
        <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Staff Profile' : 'Create Staff Profile'}</h1>
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
              disabled={isEdit} // Email should not be changed on edit
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required={!isEdit}
              className="w-full border px-3 py-2 rounded"
              placeholder={isEdit ? 'Leave blank to keep unchanged' : ''}
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
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Staff' : 'Create Staff')}
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