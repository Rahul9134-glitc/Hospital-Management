
import mongoose from 'mongoose';

const billingItemSchema = new mongoose.Schema({
    description: { 
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    unitPrice: {
        type: Number,
        required: true
    },
    total: { 
        type: Number,
        required: true
    }
});

const billingSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    items: [billingItemSchema], 
    subTotal: {
        type: Number,
        required: true
    },
    taxRate: {
        type: Number,
        default: 0.05
    },
    taxAmount: {
        type: Number,
        required: true
    },
    grandTotal: { 
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Cancelled'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const Billing = mongoose.model('Billing', billingSchema);

export default Billing;