"use client"
import React, { useState, useEffect } from 'react';
// import { propertyHomes } from '@/app/api/propertyhomes';
import { useParams } from "next/navigation";
import { Icon } from '@iconify/react';
import { testimonials } from '@/app/api/testimonial';
import Link from 'next/link';
import Image from 'next/image';
import { useRooms } from '@/hooks/useRooms';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { getCurrentRoomRate, formatCurrency } from '@/lib/roomPricing';

type Feedback = {
  _id: string;
  guestName: string;
  guestImage?: string;
  rating: number;
  comment: string;
  cleanliness: number;
  comfort: number;
  service: number;
  value: number;
  createdAt: string;
};

export default function Details() {
    const { slug } = useParams();

    const { rooms } = useRooms();
    const { settings: systemSettings } = useSystemSettings();
    const item = rooms.find((item) => item.slug === slug);
    
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loadingFeedback, setLoadingFeedback] = useState(true);
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

    // Fetch feedback for this room
    useEffect(() => {
        if (item?.slug) {
            fetch(`http://localhost:3001/feedback/room/${item.slug}`)
                .then(res => res.json())
                .then(data => {
                    // Backend should join with user table to get profile images
                    // The feedback data should already include guestImage from the backend
                    setFeedback(data.feedback || []);
                    setAverageRating(data.averageRating || 0);
                    setTotalReviews(data.totalReviews || 0);
                })
                .catch(err => console.error('Error fetching feedback:', err))
                .finally(() => setLoadingFeedback(false));
        }
    }, [item?.slug]);

    // Auto-scroll reviews every 4 seconds
    useEffect(() => {
        if (feedback.length > 1) {
            const interval = setInterval(() => {
                setCurrentReviewIndex((prevIndex) => 
                    prevIndex === feedback.length - 1 ? 0 : prevIndex + 1
                );
            }, 4000);

            return () => clearInterval(interval);
        }
    }, [feedback.length]);



    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`text-lg ${
                            star <= rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <section className="!pt-44 pb-20 relative" >
            <div className="container mx-auto max-w-8xl px-5 2xl:px-0">
                <div className="grid grid-cols-12 items-end gap-6">
                    <div className="lg:col-span-8 col-span-12">
                        <h1 className='lg:text-52 text-40 font-semibold text-dark dark:text-white'>{item?.name}</h1>
                        <div className="flex gap-2.5">
                            <Icon icon="ph:map-pin" width={24} height={24} className="text-dark/50 dark:text-white/50" />
                            <p className='text-dark/50 dark:text-white/50 text-xm'>{item?.location}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-4 col-span-12">
                        <div className='flex'>
                            <div className='flex flex-col gap-2 border-e border-black/10 dark:border-white/20 pr-2 xs:pr-4 mobile:pr-8'>
                                <Icon icon={'solar:bed-linear'} width={20} height={20} />
                                <p className='text-sm mobile:text-base font-normal text-black dark:text-white'>
                                    {item?.beds} Bedrooms
                                </p>
                            </div>
                            <div className='flex flex-col gap-2 border-e border-black/10 dark:border-white/20 px-2 xs:px-4 mobile:px-8'>
                                <Icon icon={'solar:bath-linear'} width={20} height={20} />
                                <p className='text-sm mobile:text-base font-normal text-black dark:text-white'>
                                    {item?.baths} Bathrooms
                                </p>
                            </div>
                            <div className='flex flex-col gap-2 pl-2 xs:pl-4 mobile:pl-8'>
                                <Icon
                                    icon={'lineicons:arrow-all-direction'}
                                    width={20}
                                    height={20}
                                />
                                <p className='text-sm mobile:text-base font-normal text-black dark:text-white'>
                                    {item?.area}m<sup>2</sup>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-12 mt-8 gap-8">
                    <div className="lg:col-span-8 col-span-12 row-span-2">
                        {item?.images && item?.images[0] && (
                            <div className="">
                                <Image
                                    src={item.images[0]?.src}
                                    alt="Main Property Image"
                                    width={400}
                                    height={500}
                                    className="rounded-2xl w-full h-540"
                                    unoptimized={true}
                                />
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-4 lg:block hidden">
                        {item?.images && item?.images[1] && (
                            <Image src={item.images[1]?.src} alt="Property Image 2" width={400} height={500} className="rounded-2xl w-full h-full" unoptimized={true} />
                        )}
                    </div>
                    <div className="lg:col-span-2 col-span-6">
                        {item?.images && item?.images[2] && (
                            <Image src={item.images[2]?.src} alt="Property Image 3" width={400} height={500} className="rounded-2xl w-full h-full" unoptimized={true} />
                        )}
                    </div>
                    <div className="lg:col-span-2 col-span-6">
                        {item?.images && item?.images[3] && (
                            <Image src={item.images[3]?.src} alt="Property Image 4" width={400} height={500} className="rounded-2xl w-full h-full" unoptimized={true} />
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-8 mt-10">
                    <div className="lg:col-span-8 col-span-12">
                        <h3 className='text-xl font-medium'>Property details</h3>
                        <div className="py-8 my-8 border-y border-dark/10 dark:border-white/20 flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <div>
                                    <Image src="/images/SVGs/property-details.svg" width={400} height={500} alt="" className='w-8 h-8 dark:hidden' unoptimized={true} />
                                    <Image src="/images/SVGs/property-details-white.svg" width={400} height={500} alt="" className='w-8 h-8 dark:block hidden' unoptimized={true} />
                                </div>
                                <div>
                                    <h3 className='text-dark dark:text-white text-xm'>Property details</h3>
                                    <p className='text-base text-dark/50 dark:text-white/50'>
                                        One of the few homes in the area with a private pool.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div>
                                    <Image src="/images/SVGs/smart-home-access.svg" width={400} height={500} alt="" className='w-8 h-8 dark:hidden' unoptimized={true} />
                                    <Image src="/images/SVGs/smart-home-access-white.svg" width={400} height={500} alt="" className='w-8 h-8 dark:block hidden' unoptimized={true} />
                                </div>
                                <div>
                                    <h3 className='text-dark dark:text-white text-xm'>Smart home access</h3>
                                    <p className='text-base text-dark/50 dark:text-white/50'>
                                        Easily check yourself in with a modern keypad system.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div>
                                    <Image src="/images/SVGs/energyefficient.svg" width={400} height={500} alt="" className='w-8 h-8 dark:hidden' unoptimized={true} />
                                    <Image src="/images/SVGs/energyefficient-white.svg" width={400} height={500} alt="" className='w-8 h-8 dark:block hidden' unoptimized={true} />
                                </div>
                                <div>
                                    <h3 className='text-dark dark:text-white text-xm'>Energy efficient</h3>
                                    <p className='text-base text-dark/50 dark:text-white/50'>
                                        Built in 2025 with sustainable and smart-home features.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5">
                            <p className='text-dark dark:text-white text-xm '>
                                Nestled in the heart of miami, the modern luxe villa at 20 s aurora ave offers a perfect blend of contemporary
                                elegance and smart-home innovation. priced at $570000, this 560 ft² residence features 4 spacious bedrooms,
                                3 luxurious bathrooms, and expansive living areas designed for comfort and style. built in 2025, the home
                                boasts energy-efficient systems, abundant natural light, and state-of-the-art security features. outdoor
                                spaces include two stylish bar areas, perfect for entertaining 8+ guests. enjoy the ultimate in modern living
                                with premium amenities and a prime location.
                            </p>
                            <p className='text-dark dark:text-white text-xm '>
                                Step inside to discover an open-concept layout that seamlessly connects the kitchen, dining, and living spaces.
                                the gourmet kitchen is equipped with top-of-the-line appliances, sleek cabinetry, and a large island perfect
                                for casual dining or meal prep. the sunlit living room offers floor-to-ceiling windows, creating a bright and
                                airy atmosphere while providing stunning views of the outdoor space.
                            </p>
                            <p className='text-dark dark:text-white text-xm '>
                                The primary suite serves as a private retreat with a spa-like ensuite bathroom and a spacious walk-in closet.
                                each additional bedroom is thoughtfully designed with comfort and style in mind, offering ample space and modern
                                finishes. the home's three bathrooms feature high-end fixtures, custom vanities, and elegant tiling.
                            </p>
                            <p className='text-dark dark:text-white text-xm '>
                                Outdoor living is equally impressive, with a beautifully landscaped backyard, multiple lounge areas,
                                and two fully equipped bar spaces.
                            </p>
                        </div>
                        <div className="py-8 mt-8 border-t border-dark/5 dark:border-white/15">
                            <h3 className='text-xl font-medium'>What this property offers</h3>
                            <div className="grid grid-cols-3 mt-5 gap-6">
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:aperture" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Smart Home Integration</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:chart-pie-slice" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Spacious Living Areas</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:television-simple" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Energy Efficiency</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:sun" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Natural Light</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:video-camera" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Security Systems</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:cloud" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Outdoor Spaces</p>
                                </div>
                            </div>
                        </div>



                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d938779.7831767448!2d71.05098621661072!3d23.20271516446136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e82dd003ff749%3A0x359e803f537cea25!2sGANESH%20GLORY%2C%20Gota%2C%20Ahmedabad%2C%20Gujarat%20382481!5e0!3m2!1sen!2sin!4v1715676641521!5m2!1sen!2sin"
                            width="1114" height="400" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="rounded-2xl w-full">
                        </iframe>
                    </div>
                    <div className="lg:col-span-4 col-span-12">
                        <div className="bg-primary/10 p-8 rounded-2xl relative z-10 overflow-hidden">
                            <h4 className='text-dark text-3xl font-medium dark:text-white'>
                              {systemSettings && item?.roomType 
                                ? formatCurrency(getCurrentRoomRate(item.roomType, systemSettings), systemSettings)
                                : `$${item?.rate}`
                              }
                            </h4>
                            <p className='text-sm text-dark/50 dark:text-white'>Room Price per Day</p>
                            <Link href={`/properties/book?room=${item?.slug}`} className='py-4 px-8 bg-primary text-white rounded-full w-full block text-center hover:bg-dark duration-300 text-base mt-8 hover:cursor-pointer'>
                                Book Now
                            </Link>
                            <div className="absolute right-0 top-4 -z-[1]">
                                <Image src="/images/properties/vector.svg" width={400} height={500} alt="vector" unoptimized={true} />
                            </div>
                        </div>
                        
                        {/* Guest Reviews Section - Moved to price section */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-dark dark:text-white">Guest Reviews</h4>
                        {totalReviews > 0 && (
                                        <div className="flex items-center gap-2">
                                            {renderStars(averageRating)}
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {averageRating} ({totalReviews})
                                        </span>
                                    </div>
                                )}
                            </div>

                            {loadingFeedback ? (
                                <div className="text-center py-6">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">Loading reviews...</p>
                                </div>
                            ) : feedback.length > 0 ? (
                                <div className="relative">
                                    {/* Single Review with Auto-scroll */}
                                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                                    {feedback[currentReviewIndex].guestImage ? (
                                                        <Image
                                                            src={feedback[currentReviewIndex].guestImage}
                                                            alt={feedback[currentReviewIndex].guestName}
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                            unoptimized={true}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/20">
                                                            <Icon icon="ph:user" className="text-primary text-lg" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold text-dark dark:text-white text-sm">
                                                        {feedback[currentReviewIndex].guestName}
                                                    </h5>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {formatDate(feedback[currentReviewIndex].createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {renderStars(feedback[currentReviewIndex].rating)}
                                            </div>
                                        </div>
                                        
                                        <p className="text-dark dark:text-white text-xs leading-relaxed mb-3 italic">
                                            "{feedback[currentReviewIndex].comment}"
                                        </p>
                                        
                                        {/* Detailed Ratings */}
                                        <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-gray-800 rounded-lg p-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Clean:</span>
                                                <div className="flex gap-1">
                                                    {renderStars(feedback[currentReviewIndex].cleanliness)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Comfort:</span>
                                                <div className="flex gap-1">
                                                    {renderStars(feedback[currentReviewIndex].comfort)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Service:</span>
                                                <div className="flex gap-1">
                                                    {renderStars(feedback[currentReviewIndex].service)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Value:</span>
                                                <div className="flex gap-1">
                                                    {renderStars(feedback[currentReviewIndex].value)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Counter */}
                                    {feedback.length > 1 && (
                                        <div className="text-center mt-3">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                Review {currentReviewIndex + 1} of {feedback.length}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <Icon icon="ph:star" className="text-gray-400 text-3xl mx-auto mb-2" />
                                    <h5 className="text-sm font-semibold text-dark dark:text-white mb-1">No reviews yet</h5>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                        Be the first to review!
                                    </p>
                                    <button className="px-4 py-2 bg-primary text-white rounded-full hover:bg-dark transition-colors duration-300 text-sm">
                                        Write Review
                                    </button>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
