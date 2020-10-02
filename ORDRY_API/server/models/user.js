const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: {
    type: String,
    required: true,
    unique: true,
    dropDups: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["employee", "admin"]
  }
});

module.exports = mongoose.model("User", userSchema);
