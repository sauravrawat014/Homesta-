const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");


module.exports.category = async(req,res,next)=>{

    try{
        console.log("Category Parameter:", req.params.category);
        let {category} = req.params;
        let allListings = await Listing.find({category : category});
        res.render("listings/index.ejs", {allListings});

    }catch(err){
        next(err);
    }
  
};

module.exports.search = async(req,res,next)=>{

    try{
        let {q} = req.query;
        let allListings = await Listing.find({title: {$regex: q, $options: "i"}});
        res.render("listings/index.ejs", {allListings});
    } catch(err){
        next(err);
    }
};

module.exports.index = async(req,res)=>{

    let allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
    
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    const booking = await Booking.findOne({listing: listing._id, user: req.user._id});
    if(!listing){
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listing");
    }
    res.render("listings/show.ejs", {listing, booking});
};

module.exports.createListing = async(req,res,next)=>{
  
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    await newListing.save();
    req.flash("success", "new listing created");
    res.redirect("/listing");

};

module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listing");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    req.flash("success", "listing updated");
    res.redirect(`/listing/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    const deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success", "listing deleted");
    res.redirect("/listing");

};