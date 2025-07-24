"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
  cancelledBy?: { name: string; role: string };
  reservationId?: string;
  price?: number; // Added price to the type
  invoiceHtml?: string;
  bill?: any;
};

export default function ReservationTablePage() {
  const { data: session } = useSession();
  const { userRole } = useRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const created = searchParams.get("created");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [completedMsg, setCompletedMsg] = useState("");
  const [cancelMsg, setCancelMsg] = useState("");
  const [invoiceModal, setInvoiceModal] = useState<{ open: boolean; html: string }>({ open: false, html: "" });

  // Handler for check-in
  const handleCheckIn = async (id: string) => {
    setActionLoading(id + '-checkin');
    try {
      const res = await fetch(`http://localhost:3001/reservations/${id}/checkin`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Check-in failed');
      // Refresh reservations
      setReservations((prev) => prev.map(r => r._id === id ? { ...r, status: 'Checked In' } : r));
    } catch (e) {
      alert('Check-in failed');
    } finally {
      setActionLoading(null);
    }
  };
  // Handler for payment
  const handlePayment = async (id: string, reservationId: string, price: number) => {
    setActionLoading(id + '-pay');
    try {
      // Call backend to create Stripe session
      const stripeRes = await fetch("http://localhost:3001/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          reservationId: reservationId,
        }),
      });
      const stripeData = await stripeRes.json();
      if (!stripeRes.ok) throw new Error(stripeData.error || "Failed to create Stripe session");
      window.location.href = stripeData.url;
    } catch (e) {
      alert('Payment initiation failed');
    } finally {
      setActionLoading(null);
    }
  };
  // Handler for cancel
  const handleCancel = async (id: string) => {
    setActionLoading(id + '-cancel');
    try {
      const res = await fetch(`http://localhost:3001/reservations/${id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          name: session?.user?.name,
          role: userRole
        })
      });
      if (!res.ok) throw new Error('Cancel failed');
      const data = await res.json();
      setReservations((prev) => prev.map(r => r._id === id ? { ...r, status: 'Cancelled', cancelledBy: data.reservation.cancelledBy } : r));
    } catch (e) {
      alert('Cancel failed');
    } finally {
      setActionLoading(null);
    }
  };
  // Handler for check-out
  const handleCheckOut = async (id: string) => {
    setActionLoading(id + '-checkout');
    try {
      const res = await fetch(`http://localhost:3001/reservations/${id}/checkout`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Check-out failed');
      setReservations((prev) => prev.map(r => r._id === id ? { ...r, status: 'Checked Out' } : r));
      setCompletedMsg('Reservation completed successfully!');
      setTimeout(() => setCompletedMsg(''), 4000);
    } catch (e) {
      alert('Check-out failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper: show Check In button only between checkin and checkout (inclusive)
  const canShowCheckIn = (r: Reservation) => {
    if (r.status !== 'Confirmed') return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const checkinDate = new Date(r.checkin);
    checkinDate.setHours(0,0,0,0);
    const checkoutDate = new Date(r.checkout);
    checkoutDate.setHours(0,0,0,0);
    return today >= checkinDate && today <= checkoutDate;
  };

  // Add a function to fetch a single reservation by ID
  const fetchReservationById = async (id: string) => {
    const res = await fetch(`http://localhost:3001/reservations/by-id/${id}`);
    if (!res.ok) throw new Error("Failed to fetch reservation");
    const data = await res.json();
    return data.reservation;
  };

  useEffect(() => {
    if (!session?.user) return;
    const fetchReservations = async () => {
      setLoading(true);
      setError("");
      try {
        let url = "";
        if (userRole === "guest") {
          const id = session.user.id;
          const email = encodeURIComponent(session.user.email || "");
          url = `http://localhost:3001/reservations/guest/${id}?email=${email}`;
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
        {created === "1" && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 font-semibold text-center">
            Reservation created successfully!
          </div>
        )}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Reservation Id</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Check-in</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Check-out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Guests</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Additional Services</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {reservations.map((r, idx) => (
                  <tr key={r._id || idx}>
                    <td className="px-4 py-3 whitespace-nowrap">{r.reservationId}</td>
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
                    <td className="px-4 py-3 whitespace-nowrap">
                      {/* Pending actions for guest and receptionist */}
                      {r.status === 'Pending' && (
                        <>
                          {userRole === 'guest' && (
                            <button
                              className="py-1 px-4 bg-yellow-500 text-white rounded-full text-sm font-semibold hover:bg-yellow-600 disabled:opacity-60 mr-2"
                              onClick={() => handlePayment(r._id, r.reservationId || '', (r as any).price || 0)}
                              disabled={actionLoading === r._id + '-pay'}
                            >
                              {actionLoading === r._id + '-pay' ? 'Redirecting...' : 'Pay Now'}
                            </button>
                          )}
                          {(userRole === 'guest' || userRole === 'receptionist') && (
                            <button
                              className="py-1 px-4 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                              onClick={() => handleCancel(r._id)}
                              disabled={actionLoading === r._id + '-cancel'}
                            >
                              {actionLoading === r._id + '-cancel' ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </>
                      )}
                        {/* Guest actions: only Check In/Check Out */}
                      {userRole === 'guest' && r.status === 'Confirmed' && (
                        canShowCheckIn(r) ? (
                          <button
                            className="py-1 px-4 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                            onClick={() => handleCheckIn(r._id)}
                            disabled={actionLoading === r._id + '-checkin'}
                          >
                            {actionLoading === r._id + '-checkin' ? 'Checking In...' : 'Check In'}
                          </button>
                        ) : (
                          <div className="text-red-500 font-semibold">Your check-in date is not today.</div>
                        )
                      )}
                        {userRole === 'guest' && r.status === 'Checked In' && (
                        <>
                          <button
                            className="py-1 px-4 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 mr-2"
                            onClick={() => handleCheckOut(r._id)}
                            disabled={actionLoading === r.reservationId + '-checkout'}
                          >
                            {actionLoading === r._id + '-checkout' ? 'Checking Out...' : 'Check Out'}
                          </button>
                          <Link
                            href={`/report?reservationId=${r.reservationId}`}
                            className="py-1 px-4 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                          >
                            Maintenance Request
                          </Link>
                        </>
                      )}
                      {userRole === 'guest' && r.status === 'Checked Out' && (
                        <>
                          <span className="text-green-700 font-semibold">Reservation Completed</span>
                          <button
                            className="ml-2 py-1 px-4 bg-gray-700 text-white rounded-full text-sm font-semibold hover:bg-gray-900 disabled:opacity-60"
                            onClick={async () => {
                              try {
                                const reservation = await fetchReservationById(r._id);
                                setInvoiceModal({ open: true, html: reservation.invoiceHtml || "No invoice available." });
                              } catch {
                                setInvoiceModal({ open: true, html: "Failed to load invoice." });
                              }
                            }}
                          >
                            View Invoice
                          </button>
                        </>
                      )}
                      {/* Receptionist: show state message if no action */}
                      {userRole === 'receptionist' && r.status !== 'Pending' && (
                        <span className={
                          r.status === 'Cancelled' ? 'text-red-700 font-semibold' :
                          r.status === 'Checked Out' ? 'text-green-700 font-semibold' :
                          r.status === 'Checked In' ? 'text-blue-700 font-semibold' :
                          'text-gray-700 font-semibold'
                        }>
                          {r.status === 'Cancelled'
                            ? `Reservation cancelled by ${r.cancelledBy?.name || 'Unknown'} (${r.cancelledBy?.role || 'role'})`
                            : r.status === 'Checked Out'
                            ? 'Reservation completed'
                            : r.status === 'Checked In'
                            ? 'Checked In'
                            : r.status === 'Confirmed'
                            ? 'Confirmed'
                            : ''}
                        </span>
                      )}
                      {userRole === 'guest' && r.status === 'Cancelled' && (
                        <span className="text-red-700 font-semibold">Reservation cancelled by {r.cancelledBy?.name || 'Unknown'} ({r.cancelledBy?.role || 'role'})</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {completedMsg && (
          <div className="text-center text-green-600 font-semibold mb-4">{completedMsg}</div>
        )}
        {cancelMsg && (
          <div className="text-center text-red-600 font-semibold mb-4">{cancelMsg}</div>
        )}
      </div>
      {invoiceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
              onClick={() => setInvoiceModal({ open: false, html: "" })}
            >
              Close
            </button>
            <div dangerouslySetInnerHTML={{ __html: invoiceModal.html }} />
          </div>
        </div>
      )}
    </section>
  );
} 