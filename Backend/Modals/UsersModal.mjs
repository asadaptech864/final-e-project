import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: function() {
      // Password is required for regular signup, but not for Google OAuth users
      return this.provider !== 'google';
    }
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  role: {
    type: String,
    enum: ['guest', 'receptionist', 'housekeeping', 'manager', 'maintenance', 'admin'],
    default: 'guest'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    trim: true
  },
  profilePic: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  otp: {
   type: String,
   default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null 
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }

});

const Users = mongoose.model("Users", UserSchema);
export default Users;