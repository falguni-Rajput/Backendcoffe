const mongoose = require("mongoose")
const addressschema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
},
  name:{
    type:String,
    required:true,
    trim:true,
  },
  
  phonenumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, "Invalid phone number"],

  },

  address: {
    type: String,
    required: true,
    trim: true,
    match: [/^[A-Za-z0-9\s,./#-]{5,100}$/, "Invalid address"],
  },

  city: {
    type: String,
    required: true,
    trim: true,
    match: [/^[A-Za-z ]{2,50}$/, "Invalid city"],
  },

  zipcode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{6}$/, "Invalid zipcode"],
  }
})
const address = mongoose.model("address", addressschema);

module.exports = address;