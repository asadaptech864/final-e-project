'use client';
import React, { useState, useEffect } from 'react';

interface RoomTypeFormProps {
  onSuccess?: () => void;
  isEditMode?: boolean;
  roomTypeData?: {
    _id: string;
    name: string;
    description: string;
    image: string;
  };
}

const RoomTypeForm: React.FC<RoomTypeFormProps> = ({ onSuccess, isEditMode = false, roomTypeData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with room type data if in edit mode
  useEffect(() => {
    if (isEditMode && roomTypeData) {
      setName(roomTypeData.name);
      setDescription(roomTypeData.description);
    }
  }, [isEditMode, roomTypeData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!name) {
      setError('Name is required.');
      return;
    }

    // Only require image for new room types, not for editing
    if (!isEditMode && !image) {
      setError('Image is required.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      
      if (image) {
        formData.append('image', image);
      }

      const url = isEditMode 
        ? `http://localhost:3001/updateroomtype/${roomTypeData?._id}`
        : 'http://localhost:3001/addroomtype';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        body: formData,
      });
      
      if (!res.ok) throw new Error(`Failed to ${isEditMode ? 'update' : 'add'} room type`);
      
      setSuccess(true);
      
      if (!isEditMode) {
        // Reset form only for new room types
        setName('');
        setDescription('');
        setImage(null);
      }
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">{isEditMode ? 'Edit Room Type' : 'Add Room Type'}</h2>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Room type {isEditMode ? 'updated' : 'added'} successfully!</div>}
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
        <label className="block font-medium">Image {!isEditMode && '*'}</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files?.[0] || null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          required={!isEditMode}
        />
        {isEditMode && (
          <p className="text-sm text-gray-500 mt-1">Leave empty to keep existing image</p>
        )}
        {isEditMode && roomTypeData?.image && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Current image:</p>
            <img src={roomTypeData.image} alt={roomTypeData.name} className="w-20 h-16 object-cover rounded" />
          </div>
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Room Type' : 'Add Room Type')}
      </button>
    </form>
  );
};

export default RoomTypeForm; 