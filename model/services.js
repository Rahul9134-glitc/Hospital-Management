// models/Service.js

import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    // Service Identification
    name: {
        type: String,
        required: [true, 'Service name is required'],
        unique: true, // Ensure no two services have the exact same name
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Service code is required'],
        unique: true,
        trim: true
    },
    
    // Financial Information
    price: {
        type: Number,
        required: [true, 'Service price is required'],
        min: [0, 'Price cannot be negative']
    },
    
    // Categorization (for easier filtering in Billing)
    category: {
        type: String,
        enum: ['Consultation', 'Diagnostic Test', 'Procedure', 'Room Charge', 'Other'],
        default: 'Other',
        required: true
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true, // Services are active by default
        description: "If the service can be used for new billing."
    },
    
    description: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true 
});

// Export the model
const Service = mongoose.model('Service', ServiceSchema);
export default Service;