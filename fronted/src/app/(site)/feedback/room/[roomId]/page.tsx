"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Icon } from '@iconify/react';

type FeedbackFormData = {
  rating: number;
  comment: string;
  cleanliness: number;
  comfort: number;
  service: number;
  value: number;
};

export default function FeedbackPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const reservationId = searchParams.get("reservationId");

  const [formData, setFormData] = useState<FeedbackFormData>({
    rating: 0,
    comment: "",
    cleanliness: 0,
    comfort: 0,
    service: 0,
    value: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [feedbackExists, setFeedbackExists] = useState(false);
  const [roomDetails, setRoomDetails] = useState<any>(null);

  // Check if feedback already exists
  useEffect(() => {
    if (reservationId) {
      fetch(`http://localhost:3001/feedback/check/${reservationId}`)
        .then(res => res.json())
        .then(data => {
          if (data.exists) {
            setFeedbackExists(true);
          }
        })
        .catch(err => console.error('Error checking feedback:', err));
    }
  }, [reservationId]);

  // Get room details
  useEffect(() => {
    if (roomId) {
      fetch(`http://localhost:3001/rooms/${roomId}`)
        .then(res => res.json())
        .then(data => {
          if (data.room) {
            setRoomDetails(data.room);
          }
        })
        .catch(err => console.error('Error fetching room details:', err));
    }
  }, [roomId]);

  const handleRatingChange = (field: keyof FeedbackFormData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      setError("Please sign in to submit feedback");
      return;
    }

    if (!reservationId) {
      setError("Reservation ID is required");
      return;
    }

    // Validate all ratings are provided
    if (Object.values(formData).some(val => val === 0)) {
      setError("Please provide all ratings");
      return;
    }

    if (!formData.comment.trim()) {
      setError("Please provide a comment");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationId,
          guestId: session.user.id,
          guestName: session.user.name,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit feedback");
      }

      setSuccess("Feedback submitted successfully!");
      setTimeout(() => {
        router.push("/reservation-table");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error submitting feedback");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (field: keyof FeedbackFormData, value: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(field, star)}
            className={`text-2xl transition-colors ${
              star <= value ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-400`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Please sign in to submit feedback.
      </div>
    );
  }

  if (feedbackExists) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon icon="ph:check-circle" className="text-green-500 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Feedback Already Submitted</h1>
          <p className="text-gray-600 mb-6">
            You have already submitted feedback for this reservation.
          </p>
          <button
            onClick={() => router.push("/reservation-table")}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-dark transition-colors"
          >
            Back to Reservations
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="!pt-44 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-2xl px-5 2xl:px-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-dark dark:text-white text-center">
            Leave Your Feedback
          </h1>

          {roomDetails && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-dark dark:text-white mb-2">
                Room: {roomDetails.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Reservation ID: {reservationId}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-800 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-800 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium mb-2 text-dark dark:text-white">
                Overall Rating *
              </label>
              {renderStars("rating", formData.rating)}
              <p className="text-xs text-gray-500 mt-1">
                {formData.rating > 0 && `${formData.rating} out of 5 stars`}
              </p>
            </div>

            {/* Cleanliness */}
            <div>
              <label className="block text-sm font-medium mb-2 text-dark dark:text-white">
                Cleanliness *
              </label>
              {renderStars("cleanliness", formData.cleanliness)}
              <p className="text-xs text-gray-500 mt-1">
                {formData.cleanliness > 0 && `${formData.cleanliness} out of 5 stars`}
              </p>
            </div>

            {/* Comfort */}
            <div>
              <label className="block text-sm font-medium mb-2 text-dark dark:text-white">
                Comfort *
              </label>
              {renderStars("comfort", formData.comfort)}
              <p className="text-xs text-gray-500 mt-1">
                {formData.comfort > 0 && `${formData.comfort} out of 5 stars`}
              </p>
            </div>

            {/* Service */}
            <div>
              <label className="block text-sm font-medium mb-2 text-dark dark:text-white">
                Service *
              </label>
              {renderStars("service", formData.service)}
              <p className="text-xs text-gray-500 mt-1">
                {formData.service > 0 && `${formData.service} out of 5 stars`}
              </p>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium mb-2 text-dark dark:text-white">
                Value for Money *
              </label>
              {renderStars("value", formData.value)}
              <p className="text-xs text-gray-500 mt-1">
                {formData.value > 0 && `${formData.value} out of 5 stars`}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2 text-dark dark:text-white">
                Your Comments *
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
                placeholder="Share your experience with this room..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.comment.length}/500 characters
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/reservation-table")}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-dark transition-colors disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}