"use client";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const [message, setMessage] = useState("Verifying payment...");
  const [show, setShow] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    async function verifyAndConfirm() {
      if (!sessionId) {
        setMessage("No session ID found.");
        return;
      }
      // 1. Fetch session from backend
      const res = await fetch(`http://localhost:3001/stripe-session?session_id=${sessionId}`);
      const data = await res.json();
      if (data.status === "paid") {
        // 2. Confirm reservation in backend
        await fetch("http://localhost:3001/reservations/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reservationId: data.reservationId }),
        });
        // 3. Send confirmation email after payment (for guests)
        await fetch("http://localhost:3001/reservations/send-confirmation-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reservationId: data.reservationId }),
        });
        setMessage("Your payment is successfully complete.");
        setTimeout(() => setShow(false), 2000);
      } else {
        setMessage("Payment not found or not successful.");
      }
    }
    verifyAndConfirm();
  }, []);

  useEffect(() => {
    if (!show) {
      window.location.href = "/reservation-table";
    }
  }, [show]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-green-100 text-green-800 px-6 py-4 rounded shadow text-xl font-bold">
        {message}
      </div>
    </div>
  );
} 