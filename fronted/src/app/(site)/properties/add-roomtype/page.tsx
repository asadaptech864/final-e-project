import RoomTypeForm from '@/components/Properties/RoomTypeForm';
import HeroSub from '@/components/shared/HeroSub';
export default function AddRoomTypePage() {
  return (
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
  );
} 