require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router({mergeParams: true});
const Booking = require("../models/booking.js");
const {isLoggedIn} = require("../middleware.js");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay key ID
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay key secret
});

router.post("/payment/create-order", async (req, res) => {
    const { checkInDate, checkOutDate, totalPrice, listing, user } = req.body;

    try {
        // Create a Razorpay order
        const order = await razorpay.orders.create({
            amount: totalPrice * 100, // Convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        // Save booking details to the database (optional)
        const booking = new Booking({
            listing,
            user, // Assuming you have user authentication
            checkInDate,
            checkOutDate,
            totalPrice,
            paymentStatus: "pending",
            razorpayOrderId: order.id,
        });

        await booking.save();

        // Send the Razorpay order details to the frontend
        res.json({
            id: order.id, // Razorpay order ID
            amount: order.amount, // Amount in paise
            bookingId: booking._id, // Save booking ID for success page
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: "Error creating Razorpay order", error });
    }
});

module.exports = router;