const mongoose = require('mongoose');

var menuItemSchema = mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    prepared: {
        type: Boolean,
        default: false
    },
    finished: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date()
    }
}, {_id: false})

var orderMenuSchema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    menuId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    items: {
        type: [menuItemSchema],
        required: true,
        validate: menuItemsCheck
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

function menuItemsCheck(val) {
    return val.length >= 1 && val.length <= 3;
}

module.exports = mongoose.model('OrderMenu', orderMenuSchema);