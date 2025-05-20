const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
}, { timestamps: true });

module.exports = mongoose.model("Image", imageSchema);
