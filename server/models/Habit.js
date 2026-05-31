const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    // Name of the habit — e.g. "Morning run"
    name: {
      type: String,
      required: true,
    },

    // How often — "daily", "weekdays", "weekly"
    frequency: {
      type: String,
      default: 'daily',
    },

    // Every time the user completes this habit,
    // we push that date into this array
    // e.g. ["2025-05-28", "2025-05-29"]
    completedDates: {
      type: [Date],
      default: [],
    },

    // How many days in a row they've done it
    streak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;