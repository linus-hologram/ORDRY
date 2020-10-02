const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    dropDups: true
  },
  date: {
    type: Date,
    required: true,
    default: Date()
  }
});

module.exports = mongoose.model("Email", sessionSchema);
