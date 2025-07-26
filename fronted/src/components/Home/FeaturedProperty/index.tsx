"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useFeaturedRoom } from "@/hooks/useFeaturedRoom";
import { Icon } from "@iconify/react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { getCurrentRoomRate, formatCurrency } from "@/lib/roomPricing";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const FeaturedProperty: React.FC = () => {
  const { featuredRoom, loading, error } = useFeaturedRoom();
  const { settings: systemSettings } = useSystemSettings();
  const [api, setApi] = React.useState<CarouselApi | undefined>(undefined);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  if (loading) {
    return (
      <section>
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          <div className="text-center py-20">
            <p className="text-lg">Loading featured room...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !featuredRoom) {
    return (
      <section>
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          <div className="text-center py-20">
            <p className="text-lg text-red-500">Error: {error || 'No featured room found'}</p>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section>
      <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="relative">
            <Carousel
              setApi={setApi}
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {featuredRoom.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={image}
                      alt={`${featuredRoom.name} - Image ${index + 1}`}
                      width={680}
                      height={530}
                      className="rounded-2xl w-full h-540"
                      unoptimized={true}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="absolute left-2/5 bg-dark/50 rounded-full py-2.5 bottom-10 flex justify-center mt-4 gap-2.5 px-2.5">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2.5 h-2.5 rounded-full ${current === index + 1 ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-10">
            <div>
              <p className="text-dark/75 dark:text-white/75 text-base font-semibold flex gap-2">
                <Icon icon="ph:house-simple-fill" className="text-2xl text-primary " />
                Featured {featuredRoom.roomType}
              </p>
              <h2 className="lg:text-52 text-40 font-medium text-dark dark:text-white">
                {featuredRoom.name}
              </h2>
              <div className="flex items-center gap-2.5">
                <Icon icon="ph:map-pin" width={28} height={26} className="text-dark/50 dark:text-white/50" />
                <p className="text-dark/50 dark:text-white/50 text-base">
                  Floor 25, Ocean View
                </p>
              </div>
            </div>
            <p className="text-base text-dark/50 dark:text-white/50">
              Experience unparalleled luxury in our Presidential Suite, located on the 25th floor with breathtaking ocean views. Priced at $1,200 per night, this 2,500 ft² suite offers 2 master bedrooms,
              3 bathrooms, a private terrace, butler service, and exclusive access to our VIP amenities. Perfect for discerning travelers seeking the ultimate hotel experience.
            </p>
            <div className="grid grid-cols-2 gap-10">
              <div className="flex items-center gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2.5 rounded-[6px]">
                  <Image
                    src={'/images/hero/sofa.svg'}
                    alt='sofa'
                    width={24}
                    height={24}
                    className='block dark:hidden'
                    unoptimized={true}
                  />
                  <Image
                    src={'/images/hero/dark-sofa.svg'}
                    alt='sofa'
                    width={24}
                    height={24}
                    className='hidden dark:block'
                    unoptimized={true}
                  />
                </div>
                <h6 className="">{featuredRoom.beds} Bedrooms</h6>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2.5 rounded-[6px]">
                  <Image
                    src={'/images/hero/tube.svg'}
                    alt='tube'
                    width={24}
                    height={24}
                    className='block dark:hidden'
                    unoptimized={true}
                  />
                  <Image
                    src={'/images/hero/dark-tube.svg'}
                    alt='tube'
                    width={24}
                    height={24}
                    className='hidden dark:block'
                    unoptimized={true}
                  />
                </div>
                <h6 className="">{featuredRoom.baths} Bathrooms</h6>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2.5 rounded-[6px]">
                  <Image
                    src={'/images/hero/parking.svg'}
                    alt='parking'
                    width={24}
                    height={24}
                    className='block dark:hidden'
                    unoptimized={true}
                  />
                  <Image
                    src={'/images/hero/dark-parking.svg'}
                    alt='parking'
                    width={24}
                    height={24}
                    className='hidden dark:block'
                    unoptimized={true}
                  />
                </div>
                <h6 className="">Butler Service</h6>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2.5 rounded-[6px]">
                  <Image
                    src={'/images/hero/bar.svg'}
                    alt='bar'
                    width={24}
                    height={24}
                    className='block dark:hidden'
                    unoptimized={true}
                  />
                  <Image
                    src={'/images/hero/dark-bar.svg'}
                    alt='bar'
                    width={24}
                    height={24}
                    className='hidden dark:block'
                    unoptimized={true}
                  />
                </div>
                <h6 className="">Private Terrace</h6>
              </div>
            </div>
            <div className="flex gap-10">
              <Link href={`/properties/book?room=${featuredRoom.id}`} className="py-4 px-8 bg-primary hover:bg-dark duration-300 rounded-full text-white">
                Book Now
              </Link>
              <div>
                <h4 className="text-3xl text-dark dark:text-white font-medium">
                  {systemSettings && featuredRoom.roomType 
                    ? formatCurrency(getCurrentRoomRate(featuredRoom.roomType, systemSettings), systemSettings)
                    : `$${featuredRoom.rate}`
                  }
                </h4>
                <p className="text-base text-dark/50">
                  Per night
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperty;
