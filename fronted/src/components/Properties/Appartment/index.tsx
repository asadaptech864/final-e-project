"use client"
import PropertyCard from '@/components/Home/Properties/Card/Card'
// import { propertyHomes } from '@/app/api/propertyhomes'
import { useRooms } from '@/hooks/useRooms'
// import { useParams } from "next/navigation";
interface AppartmentProps {
  roomType?: string;
}
const Appartment: React.FC<AppartmentProps> = ({ roomType }) => {
    // const { slug } = useParams();
    const { rooms, loading, error } = useRooms();

    if (loading) {
      return (
        <section className='pt-0!'>
          <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
            <div className='text-center py-20'>
              <p className='text-lg'>Loading rooms...</p>
            </div>
          </div>
        </section>
      );
    }
  
    if (error) {
      return (
        <section className='pt-0!'>
          <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
            <div className='text-center py-20'>
              <p className='text-lg text-red-500'>Error: {error}</p>
            </div>
          </div>
        </section>
      );
    }
    // Use roomType prop if provided, otherwise fallback to no filter
    const filteredRooms = roomType ? rooms.filter((item) => item.roomType === roomType) : rooms;
    return (
        <section className='pt-0!'>
            <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10'>
                {filteredRooms.map((item, index) => (
            <div key={index} className=''>
              <PropertyCard item={item} />
            </div>
          ))}
                  
                </div>
            </div>
        </section>
    )
}

export default Appartment;