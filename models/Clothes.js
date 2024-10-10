const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const clothesSchema = new Schema({
    section : {
        type : String,
        toBeRequired : true
    }, 
    name : {
        type : String,
        required : true
    },
    description :{
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    images : {
        type : [String],
        required : true
    },
    topBuys : {
        type : Boolean,
        default : false
    },
    ourRecommendation : {
        type : Boolean,
        default : false
    },
    newArrivals : {
        type : Boolean,
        default : false
    },
    inStock : {
        type : Boolean,
        default : true
    },
  });

  const clothes = mongoose.model('Clothes',clothesSchema);
  clothes.createIndexes();
  module.exports = clothes;