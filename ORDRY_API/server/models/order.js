const mongoose = require('mongoose');

// .plugin(function(schema, options) {
//     schema.pre('save', function(next) {
//         this.finished = (this.amount == this.prepared);

//         next();
//     })
// })

var orderSchema = mongoose.Schema({
    forename: {
        type: String,
        required: true
    },
    surname: {
        type: String,
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
});



module.exports = mongoose.model('Order', orderSchema);