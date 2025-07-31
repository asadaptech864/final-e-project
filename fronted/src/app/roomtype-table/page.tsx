"use client";
import React, { useState } from "react";
import { useRoomTypes } from "@/hooks/useRoomTypes";
import HeroSub from "@/components/shared/HeroSub";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import RoomTypeForm from "@/components/Properties/RoomTypeForm";
import ConfirmationModal from "@/components/ui/confirmation-modal";

const PAGE_SIZE = 5;

const RoomTypeTablePage = () => {
  const { roomTypes, loading, error, deleteRoomType, refreshRoomTypes } = useRoomTypes();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomTypeToDelete, setRoomTypeToDelete] = useState<any>(null);

  // Filter room types by name
  const filteredRoomTypes = roomTypes.filter(type =>
    type.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredRoomTypes.length / PAGE_SIZE) || 1;
  const paginatedRoomTypes = filteredRoomTypes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 if search changes
  React.useEffect(() => { setPage(1); }, [search]);

  const handleEdit = (roomType: any) => {
    // Convert the mapped room type back to the format expected by RoomTypeForm
    const roomTypeData = {
      _id: roomType.slug,
      name: roomType.name,
      description: roomType.description,
      image: roomType.image
    };
    setSelectedRoomType(roomTypeData);
    setShowEditModal(true);
  };

  const handleDeleteClick = (roomType: any) => {
    setRoomTypeToDelete(roomType);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roomTypeToDelete) return;
    
    setDeleteLoading(roomTypeToDelete.slug);
    const result = await deleteRoomType(roomTypeToDelete.slug);
    setDeleteLoading(null);
    setShowDeleteModal(false);
    setRoomTypeToDelete(null);
    
    if (!result.success) {
      alert(`Failed to delete room type: ${result.error}`);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedRoomType(null);
    refreshRoomTypes();
  };

  if (loading) return <div>Loading room types...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
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
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRoomTypes.map((type) => (
                  <tr key={type.slug} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{type.name}</td>
                    <td className="px-4 py-2 border">{type.description}</td>
                    <td className="px-4 py-2 border">
                      {type.image && (
                        <img src={type.image} alt={type.name} className="w-16 h-12 object-cover rounded" />
                      )}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(type)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(type)}
                          disabled={deleteLoading === type.slug}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                        >
                          {deleteLoading === type.slug ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedRoomTypes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4">No room types found.</td>
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
        {showEditModal && selectedRoomType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Room Type</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <RoomTypeForm
                isEditMode={true}
                roomTypeData={selectedRoomType}
                onSuccess={handleEditSuccess}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setRoomTypeToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Room Type"
          message={`Are you sure you want to delete "${roomTypeToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete Room Type"
          cancelText="Cancel"
          type="danger"
          loading={deleteLoading === roomTypeToDelete?.slug}
        />
      </>
    </ProtectedRoute>
  );
};

export default RoomTypeTablePage; 