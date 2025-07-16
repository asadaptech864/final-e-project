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
    default: 'user'
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