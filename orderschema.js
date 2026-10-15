const mongoose = require("mongoose");

const orderschema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },

  // Product Details
  name: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  size: {
    type: String
  },

 
  phonenumber: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  zipcode: {
    type: String,
    required: true
  },

  // Payment
  paymentMethod: {
    type: String,
    required: true,
    default: "Cash on Delivery"
  },

  // Order Status
  status: {
    type: String,
    default: "Placed"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const order = mongoose.model("order", orderschema);

module.exports = order;