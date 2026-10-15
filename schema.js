const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
 name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
,


rating:{
    type:Number,
    required:true
}
,
category:{
    type:String,
    required:true
}
,
image:{
    type: String,
    required:true
}
,
type: {
    type:String,
    required:true
}
,
description:{
    type:String,
    required:true,}
    ,
quantity: {
  type: Number,
  required: true,
  default: 1,
}
});

const menu = mongoose.model("menu", menuSchema);

module.exports = menu;