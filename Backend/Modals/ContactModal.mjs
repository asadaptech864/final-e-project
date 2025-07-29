import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String, // String type to match user ID format
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'replied', 'closed'],
    default: 'pending'
  },
  adminReply: {
    message: {
      type: String,
      default: null
    },
    repliedAt: {
      type: Date,
      default: null
    },
    repliedBy: {
      type: String,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
contactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact; 