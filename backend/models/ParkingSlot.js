import mongoose from 'mongoose';

const parkingSlotSchema = new mongoose.Schema({
  slotId: {
    type: String,
    required: [true, 'Please provide a unique slot ID'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingArea',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'occupied', 'expired', 'maintenance', 'blocked'],
    default: 'available',
  },
  vehicleDetails: {
    type: { type: String, enum: ['Car', 'Bike', 'Truck'], default: 'Car' },
    number: { type: String, default: '' },
    owner: { type: String, default: '' },
  },
  bookingDetails: {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  },
  activeTiming: {
    start: { type: Date, default: null },
    end: { type: Date, default: null },
  },
});

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);
export default ParkingSlot;
