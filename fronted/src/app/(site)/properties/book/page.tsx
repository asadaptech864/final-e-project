"use client";
import React, { useState, useEffect } from "react";
import { useRooms } from "@/hooks/useRooms";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MappedRoom } from "@/hooks/useRooms";
import { useSearchParams } from "next/navigation";
import { Dialog } from "@headlessui/react";
export default function BookPage() {
  const { rooms, loading } = useRooms();
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRoomId = searchParams.get("room");

  // Set default dates: today and tomorrow
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const formatDate = (date) => date.toISOString().split("T")[0];

  const [dates, setDates] = useState({
    checkin: formatDate(today),
    checkout: formatDate(tomorrow),
  });
  const [availableRooms, setAvailableRooms] = useState<MappedRoom[]>([]);
  const [checked, setChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guests, setGuests] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [dateError, setDateError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalRoom, setModalRoom] = useState<any>(null);
  const [modalGuests, setModalGuests] = useState(1);
  const [additionalServices, setAdditionalServices] = useState({
    wakeup: false,
    spa: false,
    airport: false,
    wakeupTime: "07:00",
    airportTime: "09:00",
  });

  useEffect(() => {
    setChecked(false);
    setAvailableRooms([]);
    setSelectedRoom(null);
    setError("");
    setSuccessMsg("");
    // Validate check-out date
    if (dates.checkout <= dates.checkin) {
      setDateError("Check-out date must be greater than check-in date.");
    } else {
      setDateError("");
    }
  }, [dates.checkin, dates.checkout]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDates((prev) => ({ ...prev, [name]: value }));
  };

  // The checkAvailable function only fetches available rooms, does not create a reservation.
  const checkAvailable = async () => {
    if (dates.checkout <= dates.checkin) {
      setDateError("Check-out date must be greater than check-in date.");
      return;
    }
    setChecking(true);
    setChecked(false);
    setAvailableRooms([]);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(
        `http://localhost:3001/reservations/available?checkin=${dates.checkin}&checkout=${dates.checkout}`
      );
      if (!res.ok) throw new Error("Failed to check availability");
      const data = await res.json();
      setAvailableRooms(data.availableRooms);
      setChecked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error checking availability.");
    } finally {
      setChecking(false);
    }
  };

  const openModal = (room: any) => {
    setModalRoom(room);
    setModalGuests(guests);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setModalRoom(null);
    setAdditionalServices({ wakeup: false, spa: false, airport: false, wakeupTime: "07:00", airportTime: "09:00" });
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value, type } = e.target;
    setAdditionalServices((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Calculate nights and total price
  const getNights = () => {
    const d1 = new Date(dates.checkin);
    const d2 = new Date(dates.checkout);
    return Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  };
  const getTotal = (room: any) => {
    let total = Number(room.rate) * getNights() * modalGuests;
    if (additionalServices.spa) total += 50;
    if (additionalServices.airport) total += 30;
    if (additionalServices.wakeup) total += 10;
    return total;
  };

  // The handleBook function is only called when the user clicks 'Confirm Booking' in the modal.
  const handleBook = async () => {
    if (!session?.user) {
      setError("You must be signed in to book a room.");
      return;
    }
    setConfirming(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("http://localhost:3001/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: (modalRoom as any)._id || (modalRoom as any).slug,
          guestName: session.user.name,
          guestEmail: session.user.email,
          guestId: session.user.id, // user id for backend
          checkin: dates.checkin,
          checkout: dates.checkout,
          guests: modalGuests,
          additionalServices, // send as object for backend
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to book room");
      }
      setConfirmed(true);
      setSuccessMsg("Reservation confirmed! Check your email for details.");
      setShowModal(false);
      setModalRoom(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setConfirming(false);
    }
  };

  // Filter rooms if room ID is in URL
  let displayRooms = rooms;
  if (urlRoomId) {
    displayRooms = rooms.filter((room) => (room as any)._id === urlRoomId || (room as any).slug === urlRoomId);
  }
  // If checked, show all displayRooms, but mark available/unavailable
  let availableIds = availableRooms.map((r) => (r as any)._id || (r as any).slug);
  const isSingleRoom = displayRooms.length === 1;
  const isLoggedIn = !!session?.user;

  return (
    <section className="!pt-44 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-5xl px-5 2xl:px-0">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 mb-10">
          <h1 className="text-3xl font-bold mb-4 text-dark dark:text-white text-center">Book Your Stay</h1>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <input
              type="date"
              name="checkin"
              value={dates.checkin}
              onChange={handleDateChange}
              required
              min={formatDate(today)}
              className="px-4 py-3 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full md:w-auto"
            />
            <input
              type="date"
              name="checkout"
              value={dates.checkout}
              onChange={handleDateChange}
              required
              min={dates.checkin}
              className="px-4 py-3 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full md:w-auto"
            />
            <button
              type="button"
              onClick={checkAvailable}
              className="py-3 px-8 bg-primary text-white rounded-full text-center hover:bg-dark duration-300 text-base font-semibold w-full md:w-auto"
              disabled={checking || !dates.checkin || !dates.checkout || !!dateError}
            >
              {checking ? "Checking..." : "Check Available"}
            </button>
          </div>
          {dateError && <div className="text-red-500 text-center font-medium mt-2">{dateError}</div>}
        </div>
        {error && <div className="text-red-500 text-center font-medium mb-4">{error}</div>}
        {successMsg && <div className="text-green-600 text-center font-medium mb-4">{successMsg}</div>}
        <div className={isSingleRoom ? "grid grid-cols-1" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}>
          {displayRooms.map((room) => {
            const roomId = (room as any)._id || (room as any).slug;
            const isAvailable = checked ? availableIds.includes(roomId) : true;
            let imageSrc = "/images/properties/vector.svg";
            if (room.images && room.images.length > 0) {
              if (typeof room.images[0] === "string") imageSrc = room.images[0] as string;
              else if (typeof room.images[0] === "object" && "src" in room.images[0]) imageSrc = (room.images[0] as any).src;
            }
            return (
              <div key={roomId} className={isSingleRoom ? "bg-white dark:bg-gray-800 rounded-2xl shadow p-8 flex flex-col gap-4 w-full" : "bg-white dark:bg-gray-800 rounded-2xl shadow p-6 flex flex-col gap-4"}>
                <Image
                  src={imageSrc}
                  alt={room.name}
                  width={isSingleRoom ? 600 : 320}
                  height={isSingleRoom ? 350 : 200}
                  className={isSingleRoom ? "rounded-xl w-full h-80 object-cover" : "rounded-xl w-full h-48 object-cover"}
                  unoptimized={true}
                />
                <h2 className="text-xl font-semibold text-dark dark:text-white mb-1">{room.name}</h2>
                <p className="text-dark/60 dark:text-white/60 mb-1">{room.roomType}</p>
                <p className="text-dark/60 dark:text-white/60 mb-1">{room.beds} Beds • {room.baths} Baths • {room.area}m²</p>
                <p className="text-primary font-bold text-lg mb-2">${room.rate} / night</p>
                {checked && (
                  <div className="mb-2">
                    {isAvailable ? (
                      <span className="text-green-600 font-semibold">This room is available.</span>
                    ) : (
                      <span className="text-red-500 font-semibold">This room is not available for these dates.</span>
                    )}
                  </div>
                )}
                {isAvailable && checked ? (
                  <>
                    <label className="block font-medium mb-1">Guests</label>
                    <input
                      type="number"
                      min={1}
                      max={room.capacity || 10}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="px-3 py-2 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full mb-2"
                    />
                    <button
                      className="py-3 px-6 bg-primary text-white rounded-full text-center hover:bg-dark duration-300 text-base font-semibold w-full"
                      onClick={() => isLoggedIn ? openModal(room) : setShowModal(true)}
                      disabled={confirming}
                    >
                      Book Now
                    </button>
                  </>
                ) : checked ? null : null}
              </div>
            );
          })}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-40" style={{ zIndex: 40 }} onClick={closeModal}></div>
          <div className="relative z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full mx-auto p-8 flex flex-col gap-4 animate-fade-in max-h-[80vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-dark dark:hover:text-white transition-colors">&times;</button>
            {!isLoggedIn ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">Sign in to Book</h2>
                <p className="text-dark/70 dark:text-white/70 mb-4">You must be logged in to book a room.</p>
                <a href="/signin" className="py-3 px-8 bg-primary text-white rounded-full text-center hover:bg-dark duration-300 text-base font-semibold">Login</a>
              </div>
            ) : modalRoom && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-dark dark:text-white text-center">Confirm Your Booking</h2>
                <div className="mb-4">
                  <Image
                    src={modalRoom.images && modalRoom.images.length > 0 && typeof modalRoom.images[0] === 'object' && 'src' in modalRoom.images[0] ? modalRoom.images[0].src : (typeof modalRoom.images[0] === 'string' ? modalRoom.images[0] : "/images/properties/vector.svg")}
                    alt={modalRoom.name}
                    width={400}
                    height={250}
                    className="rounded-xl w-full h-48 object-cover mb-2"
                    unoptimized={true}
                  />
                  <div className="mb-2 text-dark dark:text-white">
                    <b>Room:</b> {modalRoom.name}<br />
                    <b>Type:</b> {modalRoom.roomType}<br />
                    <b>Rate:</b> ${modalRoom.rate} / night<br />
                    <b>Guests:</b> {modalGuests}<br />
                    <b>Check-in:</b> {dates.checkin}<br />
                    <b>Check-out:</b> {dates.checkout}<br />
                  </div>
                  <div className="mb-4">
                    <b>Additional Services:</b>
                    <div className="flex flex-col gap-2 mt-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="wakeup" checked={additionalServices.wakeup} onChange={handleServiceChange} />
                        Wake-up Call
                        {additionalServices.wakeup && (
                          <input type="time" name="wakeupTime" value={additionalServices.wakeupTime} onChange={handleServiceChange} className="ml-2 px-2 py-1 border rounded" />
                        )}
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="spa" checked={additionalServices.spa} onChange={handleServiceChange} />
                        Spa Appointment (+$50)
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="airport" checked={additionalServices.airport} onChange={handleServiceChange} />
                        Airport Pickup (+$30)
                        {additionalServices.airport && (
                          <input type="time" name="airportTime" value={additionalServices.airportTime} onChange={handleServiceChange} className="ml-2 px-2 py-1 border rounded" />
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="mb-4 text-lg font-bold text-primary">
                    Total: ${getTotal(modalRoom)}
                  </div>
                  <div className="flex gap-4">
                    <button
                      className="py-3 px-6 bg-primary text-white rounded-full text-center hover:bg-dark duration-300 text-base font-semibold w-full"
                      onClick={handleBook}
                      disabled={confirming}
                    >
                      {confirming ? "Booking..." : "Confirm Booking"}
                    </button>
                    <button
                      className="py-3 px-6 bg-gray-300 text-dark rounded-full text-center hover:bg-gray-400 duration-300 text-base font-semibold w-full"
                      onClick={closeModal}
                      disabled={confirming}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
} 