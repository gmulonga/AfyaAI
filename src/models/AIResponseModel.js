const mongoose = require('mongoose');

const AIResponseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: String, required: true },
  shortAnswer: { type: String, required: true },
  steps: { type: [String], default: [] },
  foodRemedies: { type: [String], default: [] },
  visitClinic: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIResponse', AIResponseSchema);
