import mongoose from 'mongoose';

const adminActivityLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminName: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Booking', 'User', 'Guide', 'Slot', 'Area'],
  },
  targetId: {
    type: String,
    required: true,
  },
  previousValues: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AdminActivityLog = mongoose.model('AdminActivityLog', adminActivityLogSchema);
export default AdminActivityLog;
