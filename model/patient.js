
import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [0, 'Age cannot be negative']
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    contact: {
        type: String,
        required: [true, 'Contact number is required']
    },
    address: {
        type: String,
        required: false
    },
    dateAdmitted: {
        type: Date,
        default: Date.now 
    },
    email: {
        type: String,
        required: [true, 'Email is required for appointments'],
        unique: true,
        trim: true,
        lowercase: true
    },
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;