const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ordersSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clothId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clothes',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: String,
        required: true
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    accept: {
        type: Boolean,
        default: null
    },
    reject: {
        type: Boolean,
        default: null
    },
  });

  const orders = mongoose.model('Orders',ordersSchema);
  orders.createIndexes();
  module.exports = orders;