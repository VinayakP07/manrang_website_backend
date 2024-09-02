const mongoose = require('mongoose');
const { Schema } = mongoose;

const complainSchema = new Schema({
    subject : {
        type : String,
        toBeRequired : true
    }, 
    description : {
        type : String,
        required : true
    }
  });

  const complain = mongoose.model('Complain',complainSchema);
  complain.createIndexes();
  module.exports = complain;