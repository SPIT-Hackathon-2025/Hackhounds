const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  username: { type: String, required: true },
  header: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("NoteRizz", noteSchema);
