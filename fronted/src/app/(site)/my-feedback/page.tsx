"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import toast, { Toaster } from 'react-hot-toast';
import HeroSub from '@/components/shared/HeroSub';

interface Feedback {
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
  roomId?: string;
  roomName?: string;
}

const MyFeedback = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Redirect if not authenticated or not a guest
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/signin");
      return;
    }

    if (session.user.role !== 'guest') {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Fetch user's feedback
  useEffect(() => {
    const fetchMyFeedback = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`http://localhost:3001/feedback/user/${session.user.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setFeedback(data.feedback || []);
        } else {
          toast.error(data.message || "Failed to fetch feedback");
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast.error("Failed to fetch feedback");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchMyFeedback();
    }
  }, [session?.user?.id]);

  // Delete feedback
  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    setDeleting(feedbackId);
    try {
      const response = await fetch(`http://localhost:3001/feedback/${feedbackId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFeedback(prev => prev.filter(f => f._id !== feedbackId));
        toast.success("Feedback deleted successfully");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete feedback");
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    } finally {
      setDeleting(null);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not a guest
  if (!session?.user || session.user.role !== 'guest') {
    return null;
  }

  return (
    <>
    <HeroSub
    title="My Feedback"
    description="View and manage your feedback."
    badge="Feedback"
/>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Toaster />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Feedback
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View and manage your feedback
                </p>
              </div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                <Icon icon="ph:arrow-left" width={16} height={16} />
                Back
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading your feedback...</p>
                </div>
              </div>
            ) : feedback.length === 0 ? (
              <div className="text-center py-12">
                <Icon 
                  icon="ph:chat-circle-text" 
                  width={64} 
                  height={64} 
                  className="mx-auto mb-4 text-gray-400 dark:text-gray-500"
                />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No feedback yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't submitted any feedback yet. Share your experience to help others!
                </p>
                <button
                  onClick={() => router.push("/properties")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Icon icon="ph:house" width={16} height={16} />
                  Browse Rooms
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {feedback.map((item) => (
                  <div
                    key={item._id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                            {item.guestImage ? (
                              <img
                                src={item.guestImage}
                                alt={item.guestName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              item.guestName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {item.guestName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Icon
                              key={i}
                              icon={i < item.rating ? "ph:star-fill" : "ph:star"}
                              width={16}
                              height={16}
                              className={i < item.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            {item.rating}/5
                          </span>
                        </div>

                        {/* Comment */}
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {item.comment}
                        </p>

                        {/* Detailed Ratings */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Cleanliness:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{item.cleanliness}/5</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Comfort:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{item.comfort}/5</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Service:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{item.service}/5</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Value:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{item.value}/5</span>
                          </div>
                        </div>

                        {/* Room Info */}
                        {item.roomName && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Room: <span className="font-medium text-gray-900 dark:text-white">{item.roomName}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteFeedback(item._id)}
                        disabled={deleting === item._id}
                        className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete feedback"
                      >
                        {deleting === item._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Icon icon="ph:trash" width={16} height={16} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default MyFeedback; 