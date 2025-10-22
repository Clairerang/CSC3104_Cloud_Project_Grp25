const mongoose = require("mongoose");

const userGameDataSchema = new mongoose.Schema({
  userId: String,
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  badges: [String]
});

module.exports = mongoose.model("UserGameData", userGameDataSchema);
