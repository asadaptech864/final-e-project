"use client";
import PropertyCard from '@/components/Home/Properties/Card/Card'
import { useRooms } from '@/hooks/useRooms'

const OfficeSpace: React.FC = () => {
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

    return (
        <section className='pt-0!'>
            <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10'>
                    {rooms.slice(0, 3).map((item, index) => (
                        <div key={index} className=''>
                            <PropertyCard item={item} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default OfficeSpace;