import { useState, useEffect, useCallback } from 'react';

// Define the backend room type structure
export interface BackendRoomType {
  _id: string;
  name: string;
  description: string;
  image: string;
}

// Define the mapped structure for RoomType
export interface MappedRoomType {
  name: string;
  description: string;
  image: string;
  slug: string;
}

export const useRoomTypes = () => {
  const [roomTypes, setRoomTypes] = useState<MappedRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/roomtypes/limited');
      if (!response.ok) {
        throw new Error('Failed to fetch room types');
      }
      const data = await response.json();
      // Map backend data to frontend structure
      const mappedRoomTypes: MappedRoomType[] = data.roomtype.map((roomType: BackendRoomType) => ({
        name: roomType.name,
        description: roomType.description,
        image: roomType.image,
        slug: roomType._id,
      }));
      setRoomTypes(mappedRoomTypes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRoomType = useCallback(async (roomTypeId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/deleteroomtype/${roomTypeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete room type');
      }
      
      // Refresh the room types list after successful deletion
      await fetchRoomTypes();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete room type' 
      };
    }
  }, [fetchRoomTypes]);

  useEffect(() => {
    fetchRoomTypes();
  }, [fetchRoomTypes]);

  return { roomTypes, loading, error, deleteRoomType, refreshRoomTypes: fetchRoomTypes };
}; 