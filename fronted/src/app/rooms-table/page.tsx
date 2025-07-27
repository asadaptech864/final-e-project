"use client";
import React, { useState } from "react";
import { useRooms } from "@/hooks/useRooms";
import HeroSub from "@/components/shared/HeroSub";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import RoomForm from "@/components/Properties/RoomForm";
import { useRole } from "@/hooks/useRole";

const PAGE_SIZE = 5;

const RoomsTablePage = () => {
  const { rooms, loading, error, deleteRoom, refreshRooms } = useRooms();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { userRole } = useRole();

  // Filter rooms by name
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredRooms.length / PAGE_SIZE) || 1;
  const paginatedRooms = filteredRooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 if search changes
  React.useEffect(() => { setPage(1); }, [search]);

  const handleEdit = (room: any) => {
    // Convert the mapped room back to the format expected by RoomForm
    const roomData = {
      _id: room.slug,
      name: room.name,
      description: room.description || '',
      rate: room.rate,
      beds: room.beds,
      baths: room.baths,
      area: room.area,
      availability: room.availability || 'Available',
      status: room.status || 'Clean',
      capacity: room.capacity || 1,
      roomType: room.roomType,
      images: room.images.map((img: any) => img.src)
    };
    setSelectedRoom(roomData);
    setShowEditModal(true);
  };

  const handleDelete = async (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      setDeleteLoading(roomId);
      const result = await deleteRoom(roomId);
      setDeleteLoading(null);
      
      if (!result.success) {
        alert(`Failed to delete room: ${result.error}`);
      }
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedRoom(null);
    refreshRooms();
  };

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    await fetch(`http://localhost:3001/rooms/update-status/${roomId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    refreshRooms();
  };

  if (loading) return <div>Loading rooms...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ProtectedRoute allowedRoles={['admin', 'manager', 'housekeeping']}>
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
            {userRole !== 'housekeeping' && (
              <a
                href="http://localhost:3000/properties/add-room"
                className="bg-primary text-base font-semibold py-4 px-8 text-white hover:bg-white hover:text-dark duration-300 hover:cursor-pointer"
                style={{borderRadius: '10px', padding: '10px 20px'}}>
                Add Room
              </a>
            )}
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
                  <th className="px-4 py-2 border">Image</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRooms.map((room) => (
                  <tr key={room.slug} className="hover:bg-gray-00">
                    <td className="px-4 py-2 border">{room.name}</td>
                    <td className="px-4 py-2 border">{room.roomType}</td>
                    <td className="px-4 py-2 border">{room.rate}</td>
                    <td className="px-4 py-2 border">{room.beds}</td>
                    <td className="px-4 py-2 border">{room.baths}</td>
                    <td className="px-4 py-2 border">{room.area}</td>
                    <td className="px-4 py-2 border">
                      {room.images[0] && (
                        <img src={room.images[0].src} alt={room.name} className="w-16 h-12 object-cover rounded" />
                      )}
                    </td>
                    <td className="px-4 py-2 border">
                      {userRole === 'housekeeping' || userRole === 'manager' ? (
                        <select
                          value={room.status}
                          onChange={e => handleStatusChange(room.slug, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Clean">Clean</option>
                          <option value="Dirty">Dirty</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Cleaning">Cleaning</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                           <select
                          value={room.status}
                          onChange={e => handleStatusChange(room.slug, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Clean">Clean</option>
                          <option value="Dirty">Dirty</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Cleaning">Cleaning</option>
                        </select>
                          <button
                            onClick={() => handleEdit(room)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(room.slug)}
                            disabled={deleteLoading === room.slug}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                          >
                            {deleteLoading === room.slug ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
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

        {/* Edit Modal */}
        {showEditModal && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Room</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <RoomForm
                isEditMode={true}
                roomData={selectedRoom}
                onSuccess={handleEditSuccess}
              />
            </div>
          </div>
        )}
      </>
    </ProtectedRoute>
  );
};

export default RoomsTablePage; 