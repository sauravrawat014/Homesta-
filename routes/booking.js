const express = require("express");
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const wrapAsync = require("../utils/wrapAsync.js");
const bookingController = require("../controllers/booking.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const ExpressError = require("../utils/ExpressError.js");
require("dotenv").config();

router.get("/booking/success/:bookingId",wrapAsync(bookingController.bookingSuccess));

router.get("/booking/:id", isLoggedIn, wrapAsync(bookingController.bookingPage));

router.post("/booking/:id/checkout", wrapAsync(bookingController.submitBookingInfo));

router.post("/cancel-booking", async(req,res)=>{

    let {bookingId, checkInDate, checkOutDate, userId} = req.body;
    const booking = await Booking.findOne({id: bookingId, user: userId});

    if(!booking){
        return new ExpressError("Booking not found or does not belong to you.", 404);
    }

    if (booking.status === "pending") {
        throw new ExpressError("Booking is already cancelled.", 400);
    }


    booking.status = "pending";
    await booking.save();

    res.render("bookings/cancellation-success.ejs", { booking });

})

module.exports = router;