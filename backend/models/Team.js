const mongoose = require('mongoose');

const memberSchema = require('./Member');

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true
  },
  teamNumber: {
    type: String,
    required: true,
    unique: true
  },
  members: {
    type: [memberSchema],
    validate: [arrayLimit, '{PATH} must have between 3 and 5 members']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

function arrayLimit(val) {
  return val.length >= 3 && val.length <= 5;
}

module.exports = mongoose.model('Team', teamSchema);
