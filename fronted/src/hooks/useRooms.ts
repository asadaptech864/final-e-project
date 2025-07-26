import { useState, useEffect, useCallback } from 'react';
import { useSystemSettings } from './useSystemSettings';
import { getCurrentRoomRate, formatCurrency } from '@/lib/roomPricing';

// Define the backend room structure
export interface BackendRoom {
  _id: string;
  name: string;
  description: string;
  rate: string;
  beds: number;
  baths: number;
  area: number;
  availability: string;
  status: string;
  capacity: number;
  roomType: string;
  images: string[];
  createdAt: string;
}

// Define the mapped structure for PropertyCard
export interface MappedRoom {
  name: string;
  slug: string;
  location: string;
  rate: string;
  beds: number;
  baths: number;
  area: number;
  roomType: string;
  images: { src: string }[];
  // Additional fields for editing
  description?: string;
  availability?: string;
  status?: string;
  capacity?: number;
}

export const useRooms = () => {
  const [rooms, setRooms] = useState<MappedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings: systemSettings } = useSystemSettings();

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/allrooms');
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      
      // Map backend data to frontend structure
      const mappedRooms: MappedRoom[] = data.rooms.map((room: BackendRoom) => {
        // Calculate dynamic rate based on room type and system settings
        let dynamicRate: string;
        if (systemSettings && room.roomType) {
          const calculatedRate = getCurrentRoomRate(room.roomType, systemSettings);
          dynamicRate = formatCurrency(calculatedRate, systemSettings);
        } else {
          // Fallback to original rate if settings or roomType not available
          dynamicRate = room.rate;
        }

        return {
          name: room.name,
          slug: room._id,
          location: room.roomType, // Using roomType as location for now
          rate: dynamicRate,
          beds: room.beds,
          baths: room.baths,
          area: room.area,
          roomType: room.roomType,
          images: room.images.map(img => ({ src: img })),
          // Include additional fields for editing
          description: room.description,
          availability: room.availability,
          status: room.status,
          capacity: room.capacity
        };
      });
      
      setRooms(mappedRooms);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [systemSettings]);

  const deleteRoom = useCallback(async (roomId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/delete/${roomId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete room');
      }
      
      // Refresh the rooms list after successful deletion
      await fetchRooms();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete room' 
      };
    }
  }, [fetchRooms]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, loading, error, deleteRoom, refreshRooms: fetchRooms };
}; 