import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  websiteName: {
    type: String,
    required: true,
    default: 'ParkSmart'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  primaryColor: {
    type: String,
    required: true,
    default: '#3b82f6'
  },
  footerText: {
    type: String,
    default: 'Next-generation IoT smart parking reservation and gate checkout platform.'
  },
  contactEmail: {
    type: String,
    default: 'amalrajk828@gmail.com'
  },
  supportPhone: {
    type: String,
    default: '+91 7594005431'
  },
  currency: {
    type: String,
    required: true,
    default: '₹'
  },
  termsText: {
    type: String,
    default: 'Standard booking terms apply.'
  },
  maintenanceMode: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
