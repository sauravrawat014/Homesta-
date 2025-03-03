const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.bookingPage = async(req,res,next)=>{

        let {id} = req.params;
        let listing = await Listing.findById(id).populate("owner");

        if (!listing) {
            return new ExpressError(404, "Listing not found");
        }
        
        res.render("bookings/booking.ejs", {listing, user: req.user});

};

module.exports.submitBookingInfo = async(req,res,next)=>{

    let { checkInDate, checkOutDate, totalPrice } = req.body;
    let listing = await Listing.findById(req.params.id).populate("owner");
    const razorpayKey = process.env.RAZORPAY_KEY_ID;

    let existingListing = await Booking.findOne({
        listing: listing._id,
        paymentStatus: "paid",
        $and : [
            { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
        ]
    });
    

    if(existingListing){
        req.flash("error", "This listing is already booked for the selected dates.");
        return res.redirect(`/booking/${req.params.id}`);
    }

    res.render("bookings/payment.ejs", { listing, checkInDate, checkOutDate, totalPrice, razorpayKey, userId: req.user._id });


};

module.exports.bookingSuccess = async (req, res, next) => {
   
        const booking = await Booking.findById(req.params.bookingId).populate("listing");

        if (!booking) {
             next(new ExpressError(404, "Booking not found"));
        }

        // Render the success page with the populated booking
        res.render("bookings/success.ejs", { booking });

};