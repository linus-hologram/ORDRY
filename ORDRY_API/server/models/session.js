const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date()
  },
  active: {
    type: Boolean,
    required: true,
    default: false
  },
  reportId: {
    type: String
  }
});

module.exports = mongoose.model("Session", sessionSchema);
