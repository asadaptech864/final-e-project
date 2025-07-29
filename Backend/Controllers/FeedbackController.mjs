import Feedback from '../Modals/FeedbackModal.mjs';
import Reservation from '../Modals/ReservationModal.mjs';
import Rooms from '../Modals/RoomsModal.mjs';
import mongoose from 'mongoose';

// Cleanup function to fix database issues
export const cleanupFeedbackDatabase = async (req, res) => {
  try {
    console.log('Starting feedback database cleanup...');
    
    // Remove problematic documents with null values
    const deleteResult = await Feedback.deleteMany({
      $or: [
        { reservationId: null },
        { reservationId: undefined },
        { guestId: null },
        { guestId: undefined },
        { guestName: null },
        { guestName: undefined }
      ]
    });
    
    console.log(`Removed ${deleteResult.deletedCount} problematic documents`);
    
    // Try to drop the conflicting index
    try {
      await Feedback.collection.dropIndex('guest_1_reservation_1');
      console.log('Successfully dropped conflicting index: guest_1_reservation_1');
    } catch (indexError) {
      console.log('Index guest_1_reservation_1 does not exist or already dropped');
    }
    
    res.json({ 
      message: 'Database cleanup completed successfully',
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      message: 'Cleanup failed', 
      error: error.message 
    });
  }
};

// Submit feedback for a reservation
export const submitFeedback = async (req, res) => {
  try {
    const { 
      reservationId, 
      rating, 
      comment, 
      cleanliness, 
      comfort, 
      service, 
      value,
      guestId,
      guestName 
    } = req.body;

    console.log('Submit feedback request:', {
      reservationId,
      guestId,
      guestName,
      rating,
      cleanliness,
      comfort,
      service,
      value
    });

    // Validate required fields
    if (!reservationId || !guestId || !guestName) {
      console.log('Missing required fields:', { reservationId, guestId, guestName });
      return res.status(400).json({ 
        message: "Missing required fields: reservationId, guestId, or guestName" 
      });
    }

    // Check if feedback already exists for this reservation
    const existingFeedback = await Feedback.findOne({ reservationId });
    if (existingFeedback) {
      console.log('Feedback already exists for reservation:', reservationId);
      return res.status(400).json({ 
        message: "Feedback already submitted for this reservation" 
      });
    }

    // Verify the reservation exists and is checked out
    const reservation = await Reservation.findOne({ reservationId });
    if (!reservation) {
      console.log('Reservation not found:', reservationId);
      return res.status(404).json({ 
        message: "Reservation not found" 
      });
    }

    if (reservation.status !== 'Checked Out') {
      console.log('Reservation not checked out:', reservation.status);
      return res.status(400).json({ 
        message: "Can only submit feedback for completed reservations" 
      });
    }

    // Create new feedback
    const feedbackData = {
      reservationId,
      roomId: reservation.room,
      guestId: guestId.toString(), // Ensure it's a string
      guestName,
      rating,
      comment,
      cleanliness,
      comfort,
      service,
      value
    };

    console.log('Creating feedback with data:', feedbackData);

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    console.log('Feedback saved successfully:', feedback._id);

    res.status(201).json({ 
      message: "Feedback submitted successfully", 
      feedback 
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      console.log('Duplicate key error detected');
      
      // If it's the old index causing issues, try to clean up
      if (error.keyPattern && error.keyPattern.guest) {
        console.log('Old index conflict detected, attempting cleanup...');
        try {
          await Feedback.collection.dropIndex('guest_1_reservation_1');
          console.log('Successfully dropped old index');
          
          // Try to save again
          const feedback = new Feedback(feedbackData);
          await feedback.save();
          
          return res.status(201).json({ 
            message: "Feedback submitted successfully after cleanup", 
            feedback 
          });
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError);
        }
      }
      
      return res.status(400).json({ 
        message: "Feedback already submitted for this reservation" 
      });
    }
    
    res.status(500).json({ 
      message: "Error submitting feedback", 
      error: error.message 
    });
  }
};

// Get feedback for a specific room
export const getRoomFeedback = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const feedback = await Feedback.find({ roomId })
      .populate('roomId', 'name roomType')
      .sort({ createdAt: -1 });

    // Get user profile images separately since guestId is stored as string
    const userIds = [...new Set(feedback.map(f => f.guestId))];
    const users = await mongoose.model('Users').find({ _id: { $in: userIds } }, 'name profilePic');
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    if (feedback.length === 0) {
      return res.status(200).json({ 
        message: "No feedback found for this room",
        feedback: [],
        averageRating: 0,
        totalReviews: 0
      });
    }

    // Calculate average rating
    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalRating / feedback.length;

    // Map feedback to include guest image
    const feedbackWithImages = feedback.map(f => {
      const user = userMap[f.guestId];
      return {
        _id: f._id,
        guestName: f.guestName,
        guestImage: user?.profilePic || null, // Include user's profile picture
        rating: f.rating,
        comment: f.comment,
        cleanliness: f.cleanliness,
        comfort: f.comfort,
        service: f.service,
        value: f.value,
        createdAt: f.createdAt
      };
    });

    res.status(200).json({
      message: "Feedback retrieved successfully",
      feedback: feedbackWithImages,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: feedback.length
    });
  } catch (error) {
    console.error('Get room feedback error:', error);
    res.status(500).json({ 
      message: "Error retrieving feedback", 
      error: error.message 
    });
  }
};

// Check if user has already submitted feedback for a reservation
export const checkFeedbackExists = async (req, res) => {
  try {
    const { reservationId } = req.params;
    
    const feedback = await Feedback.findOne({ reservationId });
    
    res.status(200).json({
      exists: !!feedback,
      feedback: feedback || null
    });
  } catch (error) {
    console.error('Check feedback exists error:', error);
    res.status(500).json({ 
      message: "Error checking feedback", 
      error: error.message 
    });
  }
};

// Get all feedback (for admin purposes)
export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('roomId', 'name roomType')
      .sort({ createdAt: -1 });

    // Get user profile images separately since guestId is stored as string
    const userIds = [...new Set(feedback.map(f => f.guestId))];
    const users = await mongoose.model('Users').find({ _id: { $in: userIds } }, 'name profilePic');
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    // Map feedback to include guest image
    const feedbackWithImages = feedback.map(f => {
      const user = userMap[f.guestId];
      return {
        _id: f._id,
        guestName: f.guestName,
        guestImage: user?.profilePic || null, // Include user's profile picture
        rating: f.rating,
        comment: f.comment,
        cleanliness: f.cleanliness,
        comfort: f.comfort,
        service: f.service,
        value: f.value,
        createdAt: f.createdAt
      };
    });

    res.status(200).json({
      message: "All feedback retrieved successfully",
      feedback: feedbackWithImages
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ 
      message: "Error retrieving feedback", 
      error: error.message 
    });
  }
};

// Get feedback for a specific user
export const getUserFeedback = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const feedback = await Feedback.find({ guestId: userId })
      .populate('roomId', 'name roomType')
      .sort({ createdAt: -1 });

    // Map feedback to include room name
    const feedbackWithRoomInfo = feedback.map(f => {
      return {
        _id: f._id,
        guestName: f.guestName,
        guestImage: f.guestImage || null,
        rating: f.rating,
        comment: f.comment,
        cleanliness: f.cleanliness,
        comfort: f.comfort,
        service: f.service,
        value: f.value,
        createdAt: f.createdAt,
        roomId: f.roomId?._id,
        roomName: f.roomId?.name || 'Unknown Room'
      };
    });

    res.status(200).json({
      message: "User feedback retrieved successfully",
      feedback: feedbackWithRoomInfo
    });
  } catch (error) {
    console.error('Get user feedback error:', error);
    res.status(500).json({ 
      message: "Error retrieving user feedback", 
      error: error.message 
    });
  }
};

// Delete feedback by ID
export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    
    const feedback = await Feedback.findById(feedbackId);
    
    if (!feedback) {
      return res.status(404).json({ 
        message: "Feedback not found" 
      });
    }

    // Optional: Add authorization check here if needed
    // For now, allowing any authenticated user to delete their own feedback
    
    await Feedback.findByIdAndDelete(feedbackId);
    
    res.status(200).json({
      message: "Feedback deleted successfully"
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ 
      message: "Error deleting feedback", 
      error: error.message 
    });
  }
};