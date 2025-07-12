"use client";
import { Icon } from '@iconify/react'
import PropertyCard from './Card/Card'
import { useRooms } from '@/hooks/useRooms'

const Properties: React.FC = () => {
  const { rooms, loading, error } = useRooms();

  if (loading) {
    return (
      <section>
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
      <section>
        <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
          <div className='text-center py-20'>
            <p className='text-lg text-red-500'>Error: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
        <div className='mb-16 flex flex-col gap-3 '>
          <div className='flex gap-2.5 items-center justify-center'>
            <span>
              <Icon
                icon={'ph:house-simple-fill'}
                width={20}
                height={20}
                className='text-primary'
              />
            </span>
            <p className='text-base font-semibold text-dark/75 dark:text-white/75'>
              Hotel Rooms
            </p>
          </div>
          <h2 className='text-40 lg:text-52 font-medium text-black dark:text-white text-center tracking-tight leading-11 mb-2'>
            Discover our elegant accommodations.
          </h2>
          <p className='text-xm font-normal text-black/50 dark:text-white/50 text-center'>
            Luxurious rooms and suites designed for your comfort and relaxation.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10'>
          {rooms.slice(0, 6).map((item, index) => (
            <div key={index} className=''>
              <PropertyCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Properties
