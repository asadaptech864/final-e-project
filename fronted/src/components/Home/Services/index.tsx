"use client";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useEffect, useState } from "react";

const Categories = () => {
  type RoomType = {
    name?: string;
    image?: string;
    description?: string;
  };
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  useEffect(() => {
    // Update the URL below to match your backend endpoint
    fetch("http://localhost:3001/roomtypes/limited")
      .then((res) => res.json())
      .then((data) => setRoomTypes(data.roomtype || []));
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute left-0 top-0">
        <Image
          src="/images/categories/Vector.svg"
          alt="vector"
          width={800}
          height={1050}
          className="dark:hidden"
          unoptimized={true}
        />
        <Image
          src="/images/categories/Vector-dark.svg"
          alt="vector"
          width={800}
          height={1050}
          className="hidden dark:block"
          unoptimized={true}
        />
      </div>
      <div className="container max-w-8xl mx-auto px-5 2xl:px-0 relative z-10">
        <div className="grid grid-cols-12 items-center gap-10">
          <div className="lg:col-span-6 col-span-12">
            <p className="text-dark/75 dark:text-white/75 text-base font-semibold flex gap-2.5">
              <Icon icon="ph:house-simple-fill" className="text-2xl text-primary " />
              Hotel Amenities
            </p>
            <h2 className="lg:text-52 text-40 mt-4 mb-2 lg:max-w-full font-medium leading-[1.2] text-dark dark:text-white">
              Experience luxury hospitality
              with world-class services.
            </h2>
            <p className="text-dark/50 dark:text-white/50 text-lg lg:max-w-full leading-[1.3] md:max-w-3/4">
              Discover our premium hotel amenities, from elegant suites to fine dining, spa treatments, and exceptional service
            </p>
            <Link href="/properties" className="py-4 px-8 bg-primary text-base leading-4 block w-fit text-white rounded-full font-semibold mt-8 hover:bg-dark duration-300">
              View amenities
            </Link>
          </div>
          {roomTypes.map((room, idx) => {
            // Determine grid and image size based on index
            let gridClass = "lg:col-span-3 col-span-6";
            let imgWidth = 320;
            let imgHeight = 412;
            if (idx === 0) {
              gridClass = "lg:col-span-6 col-span-12";
              imgWidth = 680;
              imgHeight = 386;
            } else if (idx === 1) {
              gridClass = "lg:col-span-6 col-span-12";
              imgWidth = 680;
              imgHeight = 386;
            } else if (idx === 2 || idx === 3) {
              gridClass = "lg:col-span-3 col-span-6";
              imgWidth = 320;
              imgHeight = 412;
            }
            return (
              <div key={idx} className={gridClass}>
                <div className="relative rounded-2xl overflow-hidden group">
                  <Link href={`/${room.name?.toLowerCase().replace(/\s/g, "-") || "#"}`}>
                    <Image
                      src={room.image || "/images/categories/villas.jpg"}
                      alt={room.name || "room"}
                      width={imgWidth}
                      height={imgHeight}
                      className="w-full"
                      unoptimized={true}
                    />
                  </Link>
                  <Link href={`/${room.name?.toLowerCase().replace(/\s/g, "-") || "#"}`} className="absolute w-full h-full bg-gradient-to-b from-black/0 to-black/80 top-full flex flex-col justify-between pl-10 pb-10 group-hover:top-0 duration-500">
                    <div className="flex justify-end mt-6 mr-6">
                      <div className="bg-white text-dark rounded-full w-fit p-4">
                        <Icon icon="ph:arrow-right" width={24} height={24} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <h3 className="text-white text-2xl">{room.name || "Room Type"}</h3>
                      <p className="text-white/80 text-base leading-6">{room.description || "No description available."}</p>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
