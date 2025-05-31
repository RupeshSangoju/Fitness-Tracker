const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exercise: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number },
  date: { type: Date, default: Date.now },
  calories: { type: Number, default: 0 },
});

module.exports = mongoose.model('Workout', WorkoutSchema);