import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchRoomTypes();
  }, []);

  return { roomTypes, loading, error };
}; 