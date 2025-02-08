const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  from: { type: String },
  to: { type: String},
  subject: { type: String  },
  message: { type: String },
  attachment: { type: String }, // Store the file path or URL
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Email', EmailSchema);