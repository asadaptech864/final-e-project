"use client";
import React, { useState } from "react";
import { useRooms } from "@/hooks/useRooms";
import HeroSub from "@/components/shared/HeroSub";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
const PAGE_SIZE = 5;

const RoomsTablePage = () => {
  const { rooms, loading, error } = useRooms();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Filter rooms by name
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredRooms.length / PAGE_SIZE) || 1;
  const paginatedRooms = filteredRooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 if search changes
  React.useEffect(() => { setPage(1); }, [search]);

  if (loading) return <div>Loading rooms...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <>
        <HeroSub
          title="Rooms"
          description="Discover our premium rooms, offering modern amenities and refined comfort for an unforgettable stay."
          badge="Rooms"
        />
        <div className="p-6">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <input
          className="p-2 border rounded w-full max-w-xs"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <a
          href="http://localhost:3000/properties/add-room"
          className="bg-primary text-base font-semibold py-4 px-8 text-white hover:bg-white hover:text-dark duration-300 hover:cursor-pointer"
        style={{borderRadius: '10px', padding: '10px 20px'}}>
          Add Room
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Room Type</th>
              <th className="px-4 py-2 border">Rate</th>
              <th className="px-4 py-2 border">Beds</th>
              <th className="px-4 py-2 border">Baths</th>
              <th className="px-4 py-2 border">Area</th>
              <th className="px-4 py-2 border">Room Type</th>
              <th className="px-4 py-2 border">Image</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRooms.map((room) => (
              <tr key={room.slug} className="hover:bg-gray-00">
                <td className="px-4 py-2 border">{room.name}</td>
                <td className="px-4 py-2 border">{room.location}</td>
                <td className="px-4 py-2 border">{room.rate}</td>
                <td className="px-4 py-2 border">{room.beds}</td>
                <td className="px-4 py-2 border">{room.baths}</td>
                <td className="px-4 py-2 border">{room.area}</td>
                <td className="px-4 py-2 border">{room.roomType}</td>
                <td className="px-4 py-2 border">
                  {room.images[0] && (
                    <img src={room.images[0].src} alt={room.name} className="w-16 h-12 object-cover rounded" />
                  )}
                </td>
              </tr>
            ))}
            {paginatedRooms.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4">No rooms found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
};

export default RoomsTablePage; 