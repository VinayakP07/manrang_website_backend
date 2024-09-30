const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema({
    houseno : {
        type : String,
        toBeRequired : true
    },
    userId: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
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
        type : String,
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