"use client";
import * as React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { testimonials } from "@/app/api/testimonial";

// Define the review type
interface Review {
    _id: string;
    guestName: string;
    guestImage: string | null;
    rating: number;
    comment: string;
    cleanliness: number;
    comfort: number;
    service: number;
    value: number;
    createdAt: string;
}

const Testimonial = () => {
    const [api, setApi] = React.useState<CarouselApi | undefined>(undefined);
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [reviews, setReviews] = React.useState<Review[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch all reviews for testimonials
    React.useEffect(() => {
        fetch('http://localhost:3001/feedback/all')
            .then(res => res.json())
            .then(data => {
                console.log('Fetched reviews:', data.feedback?.length || 0, 'reviews');
                console.log('Reviews data:', data.feedback);
                setReviews(data.feedback || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching reviews:', err);
                setLoading(false);
            });
    }, []);

    React.useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    // Force carousel to update when reviews change
    React.useEffect(() => {
        if (api && reviews.length > 0) {
            console.log('Carousel API available, reviews length:', reviews.length);
            console.log('Carousel scroll snap list length:', api.scrollSnapList().length);
            // Small delay to ensure carousel updates
            setTimeout(() => {
                const snapListLength = api.scrollSnapList().length;
                console.log('Updated carousel count to:', snapListLength);
                setCount(snapListLength);
            }, 100);
        }
    }, [reviews.length, api]);

    const handleDotClick = (index: number) => {
        if (api) {
            api.scrollTo(index);
        }
    };

    return (
        <section className="bg-dark relative overflow-hidden" id="testimonial">
            <div className="absolute right-0">
                <Image
                    src="/images/testimonial/Vector.png"
                    alt="victor"
                    width={700}
                    height={1039}
                    unoptimized={true}
                />
            </div>
            <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
                <div>
                    <p className="text-white text-base font-semibold flex gap-2">
                        <Icon icon="ph:house-simple-fill" className="text-2xl text-primary" />
                        Guest Reviews
                    </p>
                    <h2 className="lg:text-52 text-40 font-medium text-white">
                        What our guests say
                    </h2>
                    {!loading && reviews.length > 0 && (
                        <p className="text-white/60 text-sm mt-2">
                            Showing {reviews.length} guest reviews
                        </p>
                    )}
                </div>
                <Carousel
                    key={`carousel-${reviews.length}`}
                    setApi={setApi}
                    opts={{
                        loop: true,
                    }}
                >
                    <CarouselContent>
                        {loading ? (
                            <CarouselItem className="mt-9">
                                <div className="lg:flex items-center gap-11">
                                    <div className="flex items-start gap-11 lg:pr-20">
                                        <div>
                                            <Icon icon="ph:house-simple" width={32} height={32} className="text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-white lg:text-3xl text-2xl">Loading reviews...</h4>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ) : reviews.length > 0 ? (
                            reviews.map((review, index) => (
                                <CarouselItem key={`review-${review._id}-${index}`} className="mt-9">
                                    <div className="lg:flex items-center gap-11">
                                        <div className="flex items-start gap-11 lg:pr-20">
                                            <div>
                                                <Icon icon="ph:house-simple" width={32} height={32} className="text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-white lg:text-3xl text-2xl">"{review.comment}"</h4>
                                                <div className="flex items-center mt-8 gap-6">
                                                    <Image
                                                        src={testimonials[index % testimonials.length].image}
                                                        alt={review.guestName}
                                                        width={80}
                                                        height={80}
                                                        className="rounded-full lg:hidden block"
                                                        unoptimized={true}
                                                    />
                                                    <div>
                                                        <h6 className="text-white text-xm font-medium">{review.guestName}</h6>
                                                        <p className="text-white/40">Guest</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-full rounded-2xl overflow-hidden">
                                            <Image
                                                src={testimonials[index % testimonials.length].image}
                                                alt={review.guestName}
                                                width={440}
                                                height={440}
                                                className="lg:block hidden"
                                                unoptimized={true}
                                            />
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))
                        ) : (
                            testimonials.map((item, index) => (
                                <CarouselItem key={index} className="mt-9">
                                    <div className="lg:flex items-center gap-11">
                                        <div className="flex items-start gap-11 lg:pr-20">
                                            <div>
                                                <Icon icon="ph:house-simple" width={32} height={32} className="text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-white lg:text-3xl text-2xl">{item.review}</h4>
                                                <div className="flex items-center mt-8 gap-6">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={80}
                                                        height={80}
                                                        className="rounded-full lg:hidden block"
                                                        unoptimized={true}
                                                    />
                                                    <div>
                                                        <h6 className="text-white text-xm font-medium">{item.name}</h6>
                                                        <p className="text-white/40">{item.position}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-full rounded-2xl overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={440}
                                                height={440}
                                                className="lg:block hidden"
                                                unoptimized={true}
                                            />
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))
                        )}
                    </CarouselContent>
                </Carousel>
                <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2.5 p-2.5 bg-white/20 rounded-full">
                    {Array.from({ length: count }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`w-2.5 h-2.5 rounded-full ${current === index + 1 ? "bg-white" : "bg-white/50"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonial;
