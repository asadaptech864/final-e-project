"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";

type Reservation = {
  _id: string;
  room?: { name?: string; roomType?: string };
  checkin: string;
  checkout: string;
  guests: number;
  guestPhone: string;
  guestEmail: string;
  additionalServices?: {
    spa?: boolean;
    wakeup?: boolean;
    wakeupTime?: string;
    airport?: boolean;
    airportTime?: string;
  };
  status?: string;
};

export default function ReservationTablePage() {
  const { data: session } = useSession();
  const { userRole } = useRole();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user) return;
    const fetchReservations = async () => {
      setLoading(true);
      setError("");
      try {
        let url = "";
        if (userRole === "guest") {
          url = `http://localhost:3001/reservations/guest/${session.user.id}`;
        } else if (userRole === "receptionist") {
          url = `http://localhost:3001/reservations/all`;
        } else {
          setReservations([]);
          setLoading(false);
          return;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch reservations");
        setReservations(data.reservations || data.allReservations || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error fetching reservations");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [session?.user, userRole]);

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Please sign in to view your reservations.
      </div>
    );
  }

  return (
    <section className="!pt-44 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl px-5 2xl:px-0">
        <h1 className="text-3xl font-bold mb-8 text-dark dark:text-white text-center">Reservations</h1>
        {loading ? (
          <div className="text-center py-10 text-lg">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 font-medium py-10">{error}</div>
        ) : reservations.length === 0 ? (
          <div className="text-center text-dark/60 dark:text-white/60 py-10">No reservations found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Check-in</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Check-out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Guests</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Additional Services</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {reservations.map((r, idx) => (
                  <tr key={r._id || idx}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-dark dark:text-white">{r.room?.name || "-"}</div>
                      <div className="text-xs text-dark/60 dark:text-white/60">{r.room?.roomType || "-"}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(r.checkin).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(r.checkout).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.guests}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.guestPhone}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.guestEmail}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ul className="text-xs text-dark/70 dark:text-white/70">
                        <li><b>Spa:</b> {r.additionalServices?.spa ? "Yes" : "No"}</li>
                        <li><b>Wake-up Call:</b> {r.additionalServices?.wakeup ? `Yes, at ${r.additionalServices?.wakeupTime || "-"}` : "No"}</li>
                        <li><b>Airport Pickup:</b> {r.additionalServices?.airport ? `Yes, at ${r.additionalServices?.airportTime || "-"}` : "No"}</li>
                      </ul>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
} 