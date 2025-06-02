// In routes/exercise.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const {
  logExercise,
  getWorkouts,
  deleteWorkout,
  getProgress,
  getStreak,
  getRecommendation,
  getLibrary,
  detectExercise,
  liveDetect,
  stopLive,
} = require('../controllers/exerciseController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/log', auth, logExercise);
router.get('/workouts', auth, getWorkouts);
router.delete('/workouts/:id', auth, deleteWorkout);
router.get('/progress', auth, getProgress);
router.get('/streak', auth, getStreak);
router.get('/grok-recommend', auth, getRecommendation);
router.get('/library', getLibrary);
router.post('/detect', auth, upload.single('video'), detectExercise);
router.post('/live', auth, liveDetect);
router.post('/stop_live', auth, stopLive);

module.exports = router;