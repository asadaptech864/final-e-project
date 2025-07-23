import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Rooms', required: true },
  description: { type: String, required: true },
  urgency: { type: String, required: true },
  location: { type: String, required: true },
  allowAccess: { type: Boolean, required: true },
  issueType: { type: String, required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Maintenance', maintenanceSchema);