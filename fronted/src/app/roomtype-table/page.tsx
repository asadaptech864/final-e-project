"use client";
import React, { useState } from "react";
import { useRoomTypes } from "@/hooks/useRoomTypes";
import HeroSub from "@/components/shared/HeroSub";

const PAGE_SIZE = 5;

const RoomTypeTablePage = () => {
  const { roomTypes, loading, error } = useRoomTypes();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Filter room types by name
  const filteredRoomTypes = roomTypes.filter(type =>
    type.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredRoomTypes.length / PAGE_SIZE) || 1;
  const paginatedRoomTypes = filteredRoomTypes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 if search changes
  React.useEffect(() => { setPage(1); }, [search]);

  if (loading) return <div>Loading room types...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
    <HeroSub
                title="Room Types"
                description="Discover our premium room types, offering modern amenities and refined comfort for an unforgettable stay."
                badge="Room Types"
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
          href="http://localhost:3000/properties/add-roomtype"
          className="bg-primary text-base font-semibold py-4 px-8 text-white hover:bg-white hover:text-dark duration-300 hover:cursor-pointer"
        style={{borderRadius: '10px', padding: '10px 20px'}}>
          Add Room Type
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Image</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoomTypes.map((type) => (
              <tr key={type.slug} className="hover:bg-gray-00">
                <td className="px-4 py-2 border">{type.name}</td>
                <td className="px-4 py-2 border">{type.description}</td>
                <td className="px-4 py-2 border">
                  {type.image && (
                    <img src={type.image} alt={type.name} className="w-16 h-12 object-cover rounded" />
                  )}
                </td>
              </tr>
            ))}
            {paginatedRoomTypes.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4">No room types found.</td>
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
  );
};

export default RoomTypeTablePage; 