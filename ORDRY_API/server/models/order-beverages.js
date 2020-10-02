const mongoose = require('mongoose');

var orderBeverageSchema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    beverageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    sizeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    finished: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date()
    }
})

module.exports = mongoose.model('OrderBeverage', orderBeverageSchema);