const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/homesta";

main().then(()=>{
    console.log("Connection Established");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({
        ...obj,
        owner: "67a9d5764c9f6ef1e813e32e"
    }));

    await Listing.insertMany(initData.data);
    console.log("data initialized");
}

initDB();