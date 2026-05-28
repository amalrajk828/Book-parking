import mongoose from 'mongoose';

const parkingAreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a parking area name'],
    trim: true,
  },
  areaId: {
    type: String,
    required: [true, 'Please provide a unique parking area ID'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
  },
  city: {
    type: String,
    required: [true, 'Please provide a city'],
    trim: true,
    set: function(val) {
      if (!val) return val;
      return val
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
    }
  },
  vehicleTypes: {
    type: [String],
    default: ['Car'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'A parking area must support at least one vehicle type.'
    }
  },
  openingTime: {
    type: String,
    default: '00:00',
  },
  closingTime: {
    type: String,
    default: '23:59',
  },
  feePerHour: {
    type: Number,
    required: [true, 'Please provide a fee per hour'],
    min: [0, 'Fee cannot be negative'],
  },
  extraFeePerHour: {
    type: Number,
    default: function() {
      return this.feePerHour;
    },
    min: [0, 'Extra fee cannot be negative'],
  },
  totalSlots: {
    type: Number,
    required: [true, 'Please provide total slots'],
    min: [1, 'Must have at least 1 slot'],
  },
  availableSlots: {
    type: Number,
    default: function() {
      return this.totalSlots;
    }
  },
  occupiedSlots: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: '', // Store image URL or base64
  },
  coordinates: {
    lat: { type: Number, default: 9.9312 }, // default Kochi lat
    lng: { type: Number, default: 76.2673 }  // default Kochi lng
  },
  assignedGuide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const ParkingArea = mongoose.model('ParkingArea', parkingAreaSchema);
export default ParkingArea;
