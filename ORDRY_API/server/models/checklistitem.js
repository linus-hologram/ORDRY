const mongoose = require('mongoose');

const checklistItemSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    position: Number,
    sectionId: {
        type: Number,
        min: 0,
        max: 1
    },
    imageId: String
});

module.exports = mongoose.model('ChecklistItem', checklistItemSchema);