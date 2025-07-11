'use client';
import React, { useState } from 'react';

interface RoomTypeFormProps {
  onSuccess?: () => void;
}

const RoomTypeForm: React.FC<RoomTypeFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!name || !image) {
      setError('Name and image are required.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (image) formData.append('image', image);
      const res = await fetch('http://localhost:3001/addroomtype', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add room type');
      setSuccess(true);
      setName('');
      setDescription('');
      setImage(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">Add Room Type</h2>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Room type added successfully!</div>}
      <div>
        <label className="block font-medium">Name *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border px-2 py-1 rounded"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="block font-medium">Image *</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files?.[0] || null)}
          className="w-full"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Add Room Type'}
      </button>
    </form>
  );
};

export default RoomTypeForm; 