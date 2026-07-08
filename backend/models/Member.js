const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  registerNumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  yearOfGraduation: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

module.exports = memberSchema;
