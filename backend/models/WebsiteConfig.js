console.log('[DEBUG] WebsiteConfig model file loading...');
import mongoose from 'mongoose';
console.log('[DEBUG] WebsiteConfig model file loaded successfully');

const websiteConfigSchema = new mongoose.Schema({
  websiteName: {
    type: String,
    required: true,
    default: 'ParkSmart'
  },
  websiteLogo: {
    type: String,
    default: ''
  },
  contactEmail: {
    type: String,
    default: 'amalrajk828@gmail.com'
  },
  contactPhone: {
    type: String,
    default: '+91 7594005431'
  },
  supportAddress: {
    type: String,
    default: '123 Smart Way, Tech City'
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  currencySymbol: {
    type: String,
    required: true,
    default: '₹'
  },
  themeMode: {
    type: String,
    enum: ['light', 'dark', 'system'],
    required: true,
    default: 'system'
  },
  primaryColor: {
    type: String,
    required: true,
    default: '#3b82f6'
  },
  maintenanceMode: {
    type: Boolean,
    required: true,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'System under maintenance. We will be back shortly.'
  },
  footerText: {
    type: String,
    default: 'Next-generation IoT smart parking reservation and gate checkout platform.'
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  }
}, {
  timestamps: true
});

const WebsiteConfig = mongoose.model('WebsiteConfig', websiteConfigSchema);
export default WebsiteConfig;
