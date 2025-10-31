// models/doctor.js

import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required']
    },
    contact: {
        type: String,
        required: [true, 'Contact number is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true 
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    salary: {
        type: Number,
        required: false
    },
}, {
    timestamps: true 
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;