import RoomForm from '@/components/Properties/RoomForm';
import HeroSub from '@/components/shared/HeroSub';
export default function AddRoomPage() {
  return (
    <>
<HeroSub
    title="Add Room"
    description="Fill in the details to create a new room entry, complete with type, pricing, and availability options."
    badge="Rooms"
/>
<div className="py-8">
      <RoomForm />
    </div>
    
</>
  );
} 