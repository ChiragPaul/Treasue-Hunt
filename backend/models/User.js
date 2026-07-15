const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    registerNumber: { type: String, required: true, unique: true },
    yearOfGraduation: { type: String, required: true },
    course: { type: String, required: true },
    specialization: { type: String, required: true },
    contactNumber: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "player"], default: "player" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
