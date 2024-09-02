const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema({
    houseno : {
        type : String,
        toBeRequired : true
    }, 
    street : {
        type : String,
        required : true
    },
    landmark : {
        type : String,
    },
    city : {
        type : String,
        required : true
    },
    state : {
        type : Number,
        required : true
    },
    pincode : {
        type : Number,
        required : true
    }
  });

  const address = mongoose.model('Address',addressSchema);
  address.createIndexes();
  module.exports = address;