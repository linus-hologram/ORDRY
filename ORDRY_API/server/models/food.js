const mongoose = require('mongoose');

const foodSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    available: Boolean
});

module.exports = mongoose.model('Food', foodSchema);