const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  exercise: String,
  reps: Number,
  sets: Number, // New
  weight: Number, // New (optional, in kg)
  calories: Number, // New (calculated later)
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workout', workoutSchema);