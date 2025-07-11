'use client';

import React, { useState, useEffect } from 'react';

interface RoomType {
  _id: string;
  name: string;
}

interface RoomFormProps {
  onSuccess?: () => void;
}

const RoomForm: React.FC<RoomFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState('');
  const [beds, setBeds] = useState(1);
  const [baths, setBaths] = useState(1);
  const [area, setArea] = useState(0);
  const [availability, setAvailability] = useState('Available');
  const [status, setStatus] = useState('Clean');
  const [capacity, setCapacity] = useState(1);
  const [roomType, setRoomType] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch room types for dropdown
    const fetchRoomTypes = async () => {
      try {
        const res = await fetch('http://localhost:3001/roomtypes/limited');
        const data = await res.json();
        setRoomTypes(data.roomtype || []);
      } catch (err) {
        setRoomTypes([]);
      }
    };
    fetchRoomTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!name || !description || !rate || !beds || !baths || !area || !capacity || !roomType || !images) {
      setError('Please fill all required fields and upload images.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('rate', rate);
      formData.append('beds', beds.toString());
      formData.append('baths', baths.toString());
      formData.append('area', area.toString());
      formData.append('availability', availability);
      formData.append('status', status);
      formData.append('capacity', capacity.toString());
      formData.append('roomType', roomType);
      if (images) {
        Array.from(images).forEach((img) => formData.append('images', img));
      }
      const res = await fetch('http://localhost:3001/addroom', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add room');
      setSuccess(true);
      setName('');
      setDescription('');
      setRate('');
      setBeds(1);
      setBaths(1);
      setArea(0);
      setAvailability('Available');
      setStatus('Clean');
      setCapacity(1);
      setRoomType('');
      setImages(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">Add Room</h2>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Room added successfully!</div>}
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
        <label className="block font-medium">Description *</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border px-2 py-1 rounded"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Rate *</label>
        <input
          type="number"
          value={rate}
          onChange={e => setRate(e.target.value)}
          className="w-full border px-2 py-1 rounded"
          required
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block font-medium">Beds *</label>
          <input
            type="number"
            min={1}
            value={beds}
            onChange={e => setBeds(Number(e.target.value))}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium">Baths *</label>
          <input
            type="number"
            min={1}
            value={baths}
            onChange={e => setBaths(Number(e.target.value))}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>
      </div>
      <div>
        <label className="block font-medium">Area (sq ft) *</label>
        <input
          type="number"
          min={0}
          value={area}
          onChange={e => setArea(Number(e.target.value))}
          className="w-full border px-2 py-1 rounded"
          required
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block font-medium">Availability</label>
          <select
            value={availability}
            onChange={e => setAvailability(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-medium">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="Clean">Clean</option>
            <option value="Dirty">Dirty</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block font-medium">Capacity *</label>
        <input
          type="number"
          min={1}
          value={capacity}
          onChange={e => setCapacity(Number(e.target.value))}
          className="w-full border px-2 py-1 rounded"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Room Type *</label>
        <select
          value={roomType}
          onChange={e => setRoomType(e.target.value)}
          className="w-full border px-2 py-1 rounded"
          required
        >
          <option value="">Select Room Type</option>
          {roomTypes.map(rt => (
            <option key={rt._id} value={rt.name}>{rt.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium">Images *</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => setImages(e.target.files)}
          className="w-full"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Add Room'}
      </button>
    </form>
  );
};

export default RoomForm; 