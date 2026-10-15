const mongoose = require("mongoose");

const userschema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    match: [/^[A-Za-z ]{2,50}$/, "Enter a valid name"]
  },

  phonenumber: {
    type: String,
    required: [true, "Phone Number is required"],
    match: [/^[6-9]\d{9}$/, "Enter a valid 10 digit phone number"]
  },

email: {
  type: String,
  required: [true, "Email is required"],
  trim: true,
  lowercase: true,
  match: [/^\S+@\S+\.\S+$/, "Enter a valid email"],
},
password: {
    type: String,
    required: [true, "Password is required"],
    match: [/^.{6,}$/, "Password must be at least 6 characters"]
  }

});

const user = mongoose.model("user", userschema);

module.exports = user;