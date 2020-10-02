const mongoose = require('mongoose');

var orderFoodSchema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        index: true
    },
    prepared: {
        type: Number,
        default: 0,
        index: true
    },
    finished: {
        type: Number,
        default: 0,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date()
    },
    preparedAt: {
        type: Date,
        required: false
    }
})

module.exports = mongoose.model('OrderFood', orderFoodSchema);