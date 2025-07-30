"use client";
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [stats, setStats] = useState([
    { number: "0", label: "Happy Guests" },
    { number: "0", label: "Luxury Rooms" },
    { number: "15+", label: "Years Experience" },
    { number: "0.0", label: "Guest Rating" }
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching statistics...');
        
        // Fetch total unique guests (from users table where role is guest)
        const usersRes = await fetch('http://localhost:3001/users/allusers');
        const usersData = await usersRes.json();
        console.log('Users data:', usersData);
        const totalGuests = usersData.users?.filter((user: any) => user.role === 'guest').length || 0;
        console.log('Total guests:', totalGuests);

        // Fetch total rooms
        const roomsRes = await fetch('http://localhost:3001/allrooms');
        const roomsData = await roomsRes.json();
        console.log('Rooms data:', roomsData);
        const totalRooms = roomsData.rooms?.length || 0;
        console.log('Total rooms:', totalRooms);

        // Fetch total reservations
        const reservationsRes = await fetch('http://localhost:3001/reservations/all');
        const reservationsData = await reservationsRes.json();
        console.log('Reservations data:', reservationsData);
        const totalReservations = reservationsData.reservations?.length || 0;
        console.log('Total reservations:', totalReservations);

        // Fetch average rating from feedback
        const feedbackRes = await fetch('http://localhost:3001/feedback/all');
        const feedbackData = await feedbackRes.json();
        console.log('Feedback data:', feedbackData);
        const feedbacks = feedbackData.feedback || [];
        
        let averageRating = 0;
        if (feedbacks.length > 0) {
          const totalRating = feedbacks.reduce((sum: number, feedback: any) => sum + (feedback.rating || 0), 0);
          averageRating = parseFloat((totalRating / feedbacks.length).toFixed(1));
        }
        console.log('Average rating:', averageRating);

        setStats([
          { number: `${totalGuests}+`, label: "Happy Guests" },
          { number: `${totalRooms}`, label: "Luxury Rooms" },
          { number: `${totalReservations}+`, label: "Total Reservations" },
          { number: averageRating.toString(), label: "Guest Rating" }
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default values if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "General Manager",
      image: "/images/users/alkesh.jpg", // Using existing image
      description: "With over 15 years of hospitality experience, Sarah leads our team with passion and dedication."
    },
    {
      name: "Michael Chen",
      role: "Operations Manager",
      image: "/images/users/george.jpg", // Using existing image
      description: "Michael ensures smooth day-to-day operations and exceptional guest experiences."
    },
    {
      name: "Emily Rodriguez",
      role: "Guest Relations Manager",
      image: "/images/users/arlene.jpg", // Using existing image
      description: "Emily specializes in creating personalized experiences for our valued guests."
    },
    {
      name: "David Thompson",
      role: "Maintenance Supervisor",
      image: "/images/users/mark.jpg", // Using existing image
      description: "David and his team maintain our facilities to the highest standards."
    }
  ];

  const values = [
    {
      icon: "ph:heart",
      title: "Excellence",
      description: "We strive for excellence in every aspect of our service delivery."
    },
    {
      icon: "ph:users",
      title: "Hospitality",
      description: "Genuine care and warmth in every guest interaction."
    },
    {
      icon: "ph:shield-check",
      title: "Quality",
      description: "Maintaining the highest standards of cleanliness and comfort."
    },
    {
      icon: "ph:star",
      title: "Innovation",
      description: "Continuously improving our services and guest experience."
    }
  ];

  return (
    <div className="container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-44 pb-14 md:pb-28">
      {/* Hero Section */}
      <div className="mb-16">
        <div className="flex gap-2.5 items-center justify-center mb-3">
          <span>
            <Icon
              icon={'ph:house-simple-fill'}
              width={20}
              height={20}
              className='text-primary'
            />
          </span>
          <p className='text-base font-semibold text-badge dark:text-white/90'>
            About Us
          </p>
        </div>
        <div className='text-center'>
          <h3 className='text-4xl sm:text-52 font-medium tracking-tighter text-black dark:text-white mb-3 leading-10 sm:leading-14'>
            Welcome to Our Luxury Hotel
          </h3>
          <p className='text-xm font-normal tracking-tight text-black/50 dark:text-white/50 leading-6 max-w-3xl mx-auto'>
            Discover the perfect blend of luxury, comfort, and exceptional service. 
            Our hotel has been serving guests with dedication and warmth for over 15 years.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {loading ? (
          // Loading state - show 4 loading cards
          <>
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))
        )}
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-bold text-dark dark:text-white mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Founded in 2008, our hotel began as a small family-owned establishment with a simple mission: 
              to provide exceptional hospitality experiences that make every guest feel at home.
            </p>
            <p>
              Over the years, we've grown from a modest 10-room inn to a luxurious 25-room hotel, 
              but our commitment to personalized service and attention to detail has never wavered.
            </p>
            <p>
              Today, we continue to blend modern amenities with traditional hospitality values, 
              creating memorable experiences for guests from around the world.
            </p>
          </div>
        </div>
        <div className="relative">
          <Image
            src="/images/hero/heroBanner.png"
            alt="Hotel Exterior"
            width={600}
            height={400}
            className="rounded-xl shadow-lg"
            unoptimized={true}
          />
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-dark dark:text-white text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="flex justify-center mb-4">
                <Icon
                  icon={value.icon}
                  width={40}
                  height={40}
                  className="text-primary"
                />
              </div>
              <h3 className="text-xl font-semibold text-dark dark:text-white mb-3">{value.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-dark dark:text-white text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                  unoptimized={true}
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-dark dark:text-white mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-8 mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-dark dark:text-white mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            To provide exceptional hospitality experiences that exceed expectations, 
            creating lasting memories for our guests while maintaining the highest standards 
            of service, comfort, and luxury in every aspect of our operations.
          </p>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-dark dark:text-white mb-4">Ready to Experience Luxury?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Book your stay with us and discover the perfect blend of comfort, luxury, and exceptional service.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/properties/book">
            <button className="px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors">
              Book Now
            </button>
          </Link>
          <Link href="/contactus">
            <button className="px-8 py-3 border border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-colors">
              Contact Us
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 