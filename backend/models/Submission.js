const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    clue: { type: mongoose.Schema.Types.ObjectId, ref: "Clue", required: true },
    photoUrl: { type: String, required: true },

    mlResult: {
      predictedLabel: String,
      confidence: Number,
      raw: mongoose.Schema.Types.Mixed, 
    },

    isCorrect: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
