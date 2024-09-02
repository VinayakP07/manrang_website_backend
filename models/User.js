const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email : {
        type : String,
        toBeRequired : true,
        unique : true
    }, 
    username : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    isAdmin : {
        type : Boolean,
        default : false
    },
    isSuperAdmin : {
        type : Boolean,
        default : false
    }
  });

  const user = mongoose.model('User',userSchema);
  user.createIndexes();
  module.exports = user;