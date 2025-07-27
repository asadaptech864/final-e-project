"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
  price?: number;
  invoiceHtml?: string;
  bill?: any;
};

export default function InvoicePage() {
  const { data: session } = useSession();
  const { userRole } = useRole();
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Fetch reservation by ID
  const fetchReservationById = async (id: string) => {
    const res = await fetch(`http://localhost:3001/reservations/by-id/${id}`);
    if (!res.ok) throw new Error("Failed to fetch reservation");
    const data = await res.json();
    return data.reservation;
  };

  // Download PDF function
  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById('invoice-content');
      if (!element) {
        alert('Invoice content not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `invoice-${reservation?.reservationId || 'reservation'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!session?.user || !reservationId) return;
    
    const fetchReservation = async () => {
      setLoading(true);
      setError("");
      try {
        const reservationData = await fetchReservationById(reservationId);
        setReservation(reservationData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error fetching reservation");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservation();
  }, [session?.user, reservationId]);

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Please sign in to view the invoice.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading invoice...
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-500">
        {error || "Invoice not found"}
      </div>
    );
  }

  return (
    <section className="!pt-44 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl px-5 2xl:px-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-dark dark:text-white">
            Invoice - {reservation.reservationId}
          </h1>
          <div className="flex gap-4">
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            <Link
              href="/reservation-table"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
            >
              Back to Reservations
            </Link>
          </div>
        </div>

        {/* Invoice Content */}
        <div id="invoice-content" className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {reservation.invoiceHtml ? (
            <div 
              dangerouslySetInnerHTML={{ __html: reservation.invoiceHtml }}
              className="prose prose-lg max-w-none dark:prose-invert"
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Invoice Not Available
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                The invoice for this reservation has not been generated yet.
              </p>
            </div>
          )}
        </div>

        {/* Reservation Details Summary */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-dark dark:text-white mb-4">
            Reservation Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Room Information</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Room:</span> {reservation.room?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Type:</span> {reservation.room?.roomType || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Stay Details</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Check-in:</span> {new Date(reservation.checkin).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Check-out:</span> {new Date(reservation.checkout).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Guests:</span> {reservation.guests}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Guest Information</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Email:</span> {reservation.guestEmail}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Phone:</span> {reservation.guestPhone}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Status:</span> {reservation.status}
              </p>
              {reservation.price && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Total Price:</span> ${reservation.price}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 