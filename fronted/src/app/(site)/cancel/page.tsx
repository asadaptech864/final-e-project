"use client";
export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-red-100 text-red-800 px-6 py-4 rounded shadow text-xl font-bold">
        Your payment was cancelled or failed.<br />
        Please try again or contact support if you need help.
      </div>
      <a
        href="/reservation-table"
        className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-dark transition"
      >
        Return to Reservation and Retry Payment
      </a>
    </div>
  );
} 