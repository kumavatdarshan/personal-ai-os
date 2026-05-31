// We need mongoose to create a model
const mongoose = require('mongoose');

// A "Schema" is like a form template
// It defines what fields a Goal has and what type each field is
const goalSchema = new mongoose.Schema(
  {
    // The title of the goal — e.g. "Learn Spanish"
    // String means it must be text
    // required: true means you MUST provide this field
    title: {
      type: String,
      required: true,
    },

    // Why this goal matters to the user
    // e.g. "I want to travel to Spain next year"
    description: {
      type: String,
      default: '', // if not provided, save empty string
    },

    // When they want to achieve it by
    deadline: {
      type: Date, // stores a date e.g. 2025-12-31
    },

    // How far along they are — 0 to 100
    progress: {
      type: Number,
      default: 0, // starts at 0% when created
      min: 0,     // cannot go below 0
      max: 100,   // cannot go above 100
    },

    // Is the goal still active or finished?
    status: {
      type: String,
      default: 'active', // when created, it's active
    },
  },

  {
    // timestamps: true automatically adds two fields:
    // createdAt — when this goal was created
    // updatedAt — when this goal was last changed
    timestamps: true,
  }
);

// This creates the actual Model from the schema
// "Goal" becomes the collection name in MongoDB (stored as "goals")
const Goal = mongoose.model('Goal', goalSchema);

// Export it so other files can use it
module.exports = Goal;