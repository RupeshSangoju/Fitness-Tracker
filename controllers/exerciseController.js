const Workout = require('../models/Workout');
const User = require('../models/User');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.logExercise = async (req, res) => {
  const { exercise, reps, sets, weight } = req.body;
  try {
    const calories = Math.round(reps * sets * (weight || 5) * 0.1); // Your formula
    const workout = new Workout({ userId: req.userId, exercise, reps, sets, weight, calories });
    await workout.save();
    res.json({ msg: 'Workout saved!', workout });
  } catch (err) {
    console.error('Log exercise error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getWorkouts = async (req, res) => {
  const { startDate, endDate, exercise } = req.query;
  try {
    let filter = { userId: req.userId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (exercise) filter.exercise = new RegExp(exercise, 'i');
    const workouts = await Workout.find(filter).sort({ date: -1 });
    res.json(workouts);
  } catch (err) {
    console.error('Get workouts error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteWorkout = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Workout.deleteOne({ _id: id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: 'Workout not found or unauthorized' });
    }
    res.json({ msg: 'Workout deleted!' });
  } catch (err) {
    console.error('Delete workout error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.userId }).sort({ date: 1 });
    const labels = workouts.map((w) => new Date(w.date).toLocaleDateString());
    const calories = workouts.map((w) => w.calories || 0);
    const totalWorkouts = workouts.length;
    const totalCalories = calories.reduce((sum, val) => sum + val, 0);
    const avgCalories = totalWorkouts ? Math.round(totalCalories / totalWorkouts) : 0;
    res.json({ labels, calories, totalWorkouts, totalCalories, avgCalories });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getStreak = async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.userId }).sort({ date: -1 });
    let streak = 0;
    let lastDate = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const workout of workouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      if (!lastDate) {
        if (workoutDate.getTime() === today.getTime()) streak = 1;
        lastDate = workoutDate;
        continue;
      }
      const diffDays = (lastDate - workoutDate) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        streak++;
        lastDate = workoutDate;
      } else {
        break;
      }
    }
    res.json({ streak });
  } catch (err) {
    console.error('Get streak error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getRecommendation = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const workouts = await Workout.find({ userId: req.userId });
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const { weight, targetCalories } = user.profile;

    const prompt = `
      Return a personalized workout suggestion as a valid JSON object based on this user data:
      - Weight: ${weight || 'unknown'}kg
      - Target daily calories: ${targetCalories || 'unknown'}
      - Total calories burned recently: ${totalCalories}
      - Recent workouts: ${workouts.map((w) => `${w.exercise} (${w.reps} reps, ${w.sets} sets)`).join(', ') || 'none'}
      Format the response exactly as: {"exercise": "Push-ups", "reps": 15, "sets": 3, "weight": 0}
      Provide only the JSON object, no additional text.
    `;
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    const rawResponse = completion.choices[0].message.content;
    console.log('Raw Groq Response:', rawResponse);

    let recommendation;
    try {
      recommendation = JSON.parse(rawResponse);
      if (!recommendation.exercise || !Number.isInteger(recommendation.reps) || !Number.isInteger(recommendation.sets)) {
        throw new Error('Invalid recommendation format');
      }
    } catch (parseError) {
      console.error('Failed to parse Groq response:', parseError.message);
      recommendation = { exercise: 'Squats', reps: 15, sets: 3, weight: 0 };
    }
    res.json(recommendation);
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ exercise: 'Squats', reps: 15, sets: 3, weight: 0 });
  }
};

exports.getLibrary = async (req, res) => {
  try {
    const library = [
      { name: 'Push-ups', demo: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOG9mNHI5aTVuOTJhcWxwd3J6bnFicno0b2xzN3RweG15M3dzeTd4ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l378edm0oLZN1hmTK/giphy.gif' },
      { name: 'Squats', demo: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzFpeGNybzN4Z2pwMzU5czc5MGhseXZtc21qZWV1ZXp3bDUwc251byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2vlLAjOPXD3TccrMyp/giphy.gif' },
      { name: 'Deadlifts', demo: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2pqNTE4OXptMG1rN2NzNTR6Y2JicHE3cnBtZTVkcnM2MXlrZXEzZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xenc4lKQlhf1Ohi/giphy.gif' },
      { name: 'Pull-ups', demo: 'https://media.giphy.com/media/14xa1F3aatkNhK/giphy.gif?cid=790b7611kevwlrrzno8vqqz5nb0jwd9u81ddcqn2a8sxza2k&ep=v1_gifs_search&rid=giphy.gif&ct=g' },
      { name: 'Plank', demo: 'https://media.giphy.com/media/1etBJgfgDimAogaj6Z/giphy.gif?cid=790b7611kyhfe5id1t7b2xdwswtll2l30f7xvm2z6adzich4&ep=v1_gifs_search&rid=giphy.gif&ct=g' },
      { name: 'Lunges', demo: 'https://media.giphy.com/media/3oD3YLi7SKSQrTfnoY/giphy.gif?cid=790b7611ppl063501sqhii42kkawdzvlxq99l42mkhg7udmt&ep=v1_gifs_search&rid=giphy.gif&ct=g' },
      { name: 'Bench Press', demo: 'https://media.giphy.com/media/z1Suqc2f0GCPReDgUB/giphy.gif?cid=790b761127ulg7nntxa6bhtbq312duzpdcyhpeaaj8z1hvp0&ep=v1_gifs_search&rid=giphy.gif&ct=g' },
    ];
    res.json(library);
  } catch (err) {
    console.error('Library error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};