const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  allergies: { type: [String], default: [] },
  existing_conditions: { type: [String], default: [] }
});

module.exports = mongoose.model('User', UserSchema);
