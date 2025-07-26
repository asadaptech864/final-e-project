import mongoose from "mongoose";
const { Schema } = mongoose;

// Seasonal rates schema
const seasonalRateSchema = new Schema({
  season: { type: String, required: true },
  rate: { type: Number, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true }
});

// Room rates schema
const roomRateSchema = new Schema({
  roomType: { type: String, required: true },
  baseRate: { type: Number, required: true },
  weekendRate: { type: Number, required: true },
  holidayRate: { type: Number, required: true },
  seasonalRates: [seasonalRateSchema]
});

// General settings schema
const generalSettingsSchema = new Schema({
  hotelName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  address: { type: String, required: true },
  timezone: { type: String, required: true },
  currency: { type: String, required: true }
});

// Policies schema
const policiesSchema = new Schema({
  checkInTime: { type: String, required: true },
  checkOutTime: { type: String, required: true },
  cancellationPolicy: { type: String, required: true },
  petPolicy: { type: String, required: true },
  smokingPolicy: { type: String, required: true },
  maxGuestsPerRoom: { type: Number, required: true }
});

// Taxes schema
const taxesSchema = new Schema({
  taxRate: { type: Number, required: true },
  serviceCharge: { type: Number, required: true },
  cityTax: { type: Number, required: true },
  stateTax: { type: Number, required: true }
});

// Notifications schema
const notificationsSchema = new Schema({
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  bookingAlerts: { type: Boolean, default: true },
  maintenanceAlerts: { type: Boolean, default: true },
  paymentAlerts: { type: Boolean, default: true }
});

// Main settings schema
const settingsSchema = new Schema({
  general: { type: generalSettingsSchema, required: true },
  policies: { type: policiesSchema, required: true },
  taxes: { type: taxesSchema, required: true },
  notifications: { type: notificationsSchema, required: true },
  roomRates: [roomRateSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
settingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings; 