const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  }
});
const User = mongoose.model('User', userSchema);
module.exports = User;

