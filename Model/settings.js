// models/Settings.js

import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    // A unique identifier to ensure only one settings document exists
    // We will query by this ID to fetch the global settings
    _id: {
        type: String,
        default: 'hospitalSettings', // Use a fixed ID
        required: true
    },
    
    // Hospital Identification
    hospitalName: {
        type: String,
        required: true,
        default: 'Hospital Management System'
    },
    tagline: {
        type: String,
        default: 'Caring for your health, professionally.'
    },
    
    // Contact Information
    address: {
        type: String,
        default: '123 Health Street, City Name, PIN 400001'
    },
    phone: {
        type: String,
        default: '+91 98765 43210'
    },
    email: {
        type: String,
        default: 'contact@hms.com'
    },
    
    // Financial/Branding
    defaultCurrency: {
        type: String,
        default: 'INR'
    },
    logoUrl: {
        type: String,
        default: '/images/default_logo.png' // Default placeholder logo
    }
}, {
    timestamps: true // Tracks when settings were created/updated
});

// Export the model
const Settings = mongoose.model('Settings', SettingsSchema);
export default Settings;