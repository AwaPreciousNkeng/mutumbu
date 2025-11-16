import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    plan: {
        type: String,
        enum: ["free", "premium"],
        default: "free"
    },

    planId: {
        type: String,
        default: null
    },

    price: {
        type: Number,
        default: 0
    },

    billingCycle: {
        type: String,
        enum: ["monthly", "yearly"],
        default: "monthly"
    },

    provider: {
        type: String,
        enum: ["stripe", "om", "momo"],
        default: "momo"
    },

    transactionId: {
        type: String,
        default: null
    },

    expiresAt: {
        type: Date,
        required: false
    },

    active: {
        type: Boolean,
        default: true
    },

    cancelled: {
        type: Boolean,
        default: false
    },

    renewalAttempts: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

// Fast indexing
paymentSchema.index({ user: 1, expiresAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
