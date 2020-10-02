const mongoose = require('mongoose');

var beverageSizesSchema = mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        available: {
            type: Boolean,
            required: true,
            default: true
        }
    }
);

var beverageSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    sizes: {
        type: [beverageSizesSchema],
        required: true
    },
    category: {
        type: String,
        enum: ['kalt', 'warm', 'alkoholisch']
    }
});

module.exports = mongoose.model('Beverage', beverageSchema);
