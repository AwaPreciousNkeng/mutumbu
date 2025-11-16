import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";

// NOTE: provider integration (Stripe/MOMO/etc.) should be placed in a separate service.
// These controllers assume provider webhook/verify logic calls these endpoints when payment is confirmed.

// purchase subscription (create pending record and redirect to provider)
export const createSubscription = async (req, res) => {
    try {
        const { billingCycle = "monthly", provider, price = 0 } = req.body;

        // create a local record (inactive until provider confirms)
        const payment = await Payment.create({
            user: req.user.id,
            plan: "premium",
            planId: `${(this.plan)}-${billingCycle}`,
            price,
            billingCycle,
            provider,
            active: false,
            cancelled: false
        });

        // TODO: create checkout session with provider and return url
        // return res.json({ success: true, checkoutUrl });
        res.json({ success: true, payment });
    } catch (err) {
        console.error("createSubscription:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// provider webhook: confirm payment (call from webhook)
export const confirmPayment = async (req, res) => {
    try {
        // provider should send payment info (transactionId, userId, plan, expiresAt)
        const { transactionId, paymentId, userId, expiresAt } = req.body;

        const payment = await Payment.findByIdAndUpdate(paymentId, {
            transactionId,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            active: true
        }, { new: true });

        // upgrade user plan
        if (payment && userId) {
            await User.findByIdAndUpdate(userId, { $set: { "subscription.plan": payment.plan }});
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("confirmPayment:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// cancel subscription (user triggered)
export const cancelSubscription = async (req, res) => {
    try {
        const payment = await Payment.findOneAndUpdate({ user: req.user.id, active: true }, { active: false, cancelled: true }, { new: true });
        if (!payment) return res.status(404).json({ success: false, message: "No active subscription" });
        // TODO: call provider to cancel auto-renew
        res.json({ success: true, payment });
    } catch (err) {
        console.error("cancelSubscription:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getSubscriptionStatus = async (req, res) => {
    try {
        const payment = await Payment.findOne({ user: req.user.id, active: true }).sort({ expiresAt: 1 });
        res.json({ success: true, subscription: payment || null });
    } catch (err) {
        console.error("getSubscriptionStatus:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
