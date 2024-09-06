const mongoose = require('mongoose');
const { Schema } = mongoose;

const complainSchema = new Schema({
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
});
complainSchema.index({ userId: 1 });

const Complain = mongoose.model('Complain', complainSchema);

module.exports = Complain;
