const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  logExercise,
  getWorkouts,
  deleteWorkout,
  getProgress,
  getStreak,
  getRecommendation,
  getLibrary,
} = require('../controllers/exerciseController');

router.post('/log', auth, logExercise);
router.get('/workouts', auth, getWorkouts);
router.delete('/workouts/:id', auth, deleteWorkout);
router.get('/progress', auth, getProgress);
router.get('/streak', auth, getStreak);
router.get('/grok-recommend', auth, getRecommendation);
router.get('/library', getLibrary); // Public access

module.exports = router;