
const mongoose = require("mongoose")
const cartschema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

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

    size: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },
    totalprice:{
 type: Number,
        required: true
    }
})
const cart = mongoose.model("cart",cartschema)
module.exports = cart;