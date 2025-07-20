"use client";
import RoomTypeForm from '@/components/Properties/RoomTypeForm';
import HeroSub from '@/components/shared/HeroSub';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";

export default function AddRoomTypePage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <>
        <HeroSub
          title="Add Room Type"
          description="Provide the details to add a new room type, including features, pricing, and availability to enhance your room catalog."
          badge="Room Types"
        />
        <div className="py-8">
          <RoomTypeForm />
        </div>
      </>
    </ProtectedRoute>
  );
} 