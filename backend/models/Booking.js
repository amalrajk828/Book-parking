import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true,
    index: true,
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingArea',
    required: true,
    index: true,
  },
  vehicleDetails: {
    type: { type: String, enum: ['Car', 'Bike', 'Truck'], required: true },
    number: { type: String, required: true },
    owner: { type: String, required: true },
  },
  reservedHours: {
    type: Number,
    required: true,
    min: [1, 'Must reserve at least 1 hour'],
  },
  estimatedAmount: {
    type: Number,
    required: true,
  },
  actualAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'expired'],
    default: 'pending',
  },
  qrCode: {
    type: String, // Stores standard base64 QR code data URL
    default: '',
  },
  checkInTime: {
    type: Date,
    default: null,
  },
  checkOutTime: {
    type: Date,
    default: null,
  },
  extraCharges: {
    type: Number,
    default: 0,
  },
  extraMinutes: {
    type: Number,
    default: 0,
  },
  extraCharge: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    default: 0,
  },
  overtimeStatus: {
    type: String,
    enum: ['none', 'pending', 'paid', 'waived'],
    default: 'none',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
