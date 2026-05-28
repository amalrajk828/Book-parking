import mongoose from 'mongoose';

const guideActivityLogSchema = new mongoose.Schema({
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  guideName: {
    type: String,
    required: true,
  },
  slotId: {
    type: String,
    required: true,
  },
  previousStatus: {
    type: String,
    required: true,
  },
  newStatus: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const GuideActivityLog = mongoose.model('GuideActivityLog', guideActivityLogSchema);
export default GuideActivityLog;
