import { useState, useEffect } from 'react';

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

// Define the mapped structure for FeaturedProperty
export interface FeaturedRoom {
  name: string;
  description: string;
  rate: string;
  beds: number;
  baths: number;
  area: number;
  roomType: string;
  images: string[];
  location: string;
}

export const useFeaturedRoom = () => {
  const [featuredRoom, setFeaturedRoom] = useState<FeaturedRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedRoom = async () => {
      try {
        const response = await fetch('http://localhost:3001/featured');
        if (!response.ok) {
          throw new Error('Failed to fetch featured room');
        }
        const data = await response.json();
        
        if (data.room) {
          // Map backend data to frontend structure
          const mappedRoom: FeaturedRoom = {
            name: data.room.name,
            description: data.room.description,
            rate: data.room.rate,
            beds: data.room.beds,
            baths: data.room.baths,
            area: data.room.area,
            roomType: data.room.roomType,
            images: data.room.images,
            location: `${data.room.roomType} Room`
          };
          
          setFeaturedRoom(mappedRoom);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRoom();
  }, []);

  return { featuredRoom, loading, error };
}; 