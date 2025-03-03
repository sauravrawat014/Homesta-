if(process.env.NODE_ENV != "production"){
    require('dotenv').config();

}

console.log(process.env);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
app.use(express.json());


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const razorpayRouter = require("./routes/razorpay.js");

const dbUrl = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("Connection Established");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600
});

store.on("err", ()=>{
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now + 7 * 24 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 1000,
        httpOnly: true
    }
};


app.listen(8080, ()=>{
    console.log("server is listening on port 8080");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listing", listingRouter);
app.use("/listing/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", bookingRouter);
app.use("/", razorpayRouter);




app.all("*", (req,res,next)=>{
    next(new ExpressError(404, "page not found"));

});


app.use((err,req,res,next)=>{
    let{statusCode=500, message= "something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});

// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new Vila",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log(sampleListing);
//     res.send("Successful");
// });

