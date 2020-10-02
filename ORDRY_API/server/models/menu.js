const mongoose = require('mongoose');

var menuItemSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number
    }
);

var menuSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    food: [menuItemSchema],
    available: Boolean
});

module.exports = mongoose.model('Menu', menuSchema);