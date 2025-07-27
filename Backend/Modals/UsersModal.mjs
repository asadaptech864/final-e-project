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
    required: true
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
  }

});

const Users = mongoose.model("Users", UserSchema);
export default Users;