const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/homesta";

main().then(()=>{
    console.log("Connection Established");
    updateImage();
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const updateImage = async () => {
    try {
        const result = await Listing.findOneAndUpdate(
            { title: 'Mountain Retreat' }, // Find the document (by title or any other field)
            {
                $set: {
                    image: {
                        filename: 'listingimage',
                        url: 'https://images.unsplash.com/photo-1506059612708-99d6c258160e?q=80&w=1769&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    }
                }
            },
            { new: true } // Returns the updated document
        );
        console.log('Updated Document:', result);
    } catch (err) {
        console.log('Error updating document:', err);
    }
};