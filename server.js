const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Groq = require('groq-sdk');
require('dotenv').config();

const User = require('./models/User');
const Workout = require('./models/Workout');

const app = express();
app.use(express.json());
app.use(cors());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('No token provided');
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).send('Invalid token');
  }
};

app.post('/signup', async (req, res) => {
  const { name, email, password, weight, targetCalories, profilePic } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ 
    name, 
    email, 
    password: hashedPassword, 
    profile: { 
      weight: weight || 70, 
      targetCalories: targetCalories || 500, 
      profilePic: profilePic || ''
    },
    friends: [],
    friendRequests: []
  });
  await user.save();
  const token = jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '1h' });
  res.json({ token });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('User not found');
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Wrong password');
  const token = jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '1h' });
  res.json({ token });
});

app.post('/workouts', auth, async (req, res) => {
  const { exercise, reps, sets, weight } = req.body;
  const calories = Math.round(reps * sets * (weight || 5) * 0.1);
  const workout = new Workout({ userId: req.userId, exercise, reps, sets, weight, calories });
  await workout.save();
  res.send('Workout saved!');
});

app.get('/workouts', auth, async (req, res) => {
  const { startDate, endDate, exercise } = req.query;
  let filter = { userId: req.userId };
  if (startDate) filter.date = { $gte: new Date(startDate) };
  if (endDate) filter.date = { ...filter.date, $lte: new Date(endDate) };
  if (exercise) filter.exercise = exercise;
  const workouts = await Workout.find(filter);
  res.json(workouts);
});

app.delete('/workouts/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await Workout.deleteOne({ _id: id, userId: req.userId });
    res.send('Workout deleted!');
  } catch (error) {
    res.status(500).send('Failed to delete workout');
  }
});

app.get('/recommend', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const workouts = await Workout.find({ userId: req.userId });
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const { weight, targetCalories } = user.profile;

  try {
    const prompt = `
      Return a personalized workout suggestion as a valid JSON object based on this user data:
      - Weight: ${weight}kg
      - Target daily calories: ${targetCalories}
      - Total calories burned recently: ${totalCalories}
      - Recent workouts: ${workouts.map(w => `${w.exercise} (${w.reps} reps, ${w.sets} sets)`).join(', ')}
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

    const jsonMatch = rawResponse.match(/\{(?:[^{}]|\n)*"exercise"(?:[^{}]|\n)*\}/);
    if (jsonMatch) {
      const recommendation = JSON.parse(jsonMatch[0]);
      res.json(recommendation);
    } else {
      throw new Error('No valid JSON found in response');
    }
  } catch (error) {
    console.error('Error in /recommend:', error.message);
    res.status(500).json({ exercise: 'Squats', reps: 15, sets: 3, weight: 0 });
  }
});

app.get('/progress', auth, async (req, res) => {
  const workouts = await Workout.find({ userId: req.userId });
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalWorkouts = workouts.length;
  const avgCalories = totalWorkouts ? Math.round(totalCalories / totalWorkouts) : 0;
  res.json({ totalCalories, totalWorkouts, avgCalories });
});

app.get('/library', (req, res) => {
  const library = [
    { name: 'Push-ups', demo: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOG9mNHI5aTVuOTJhcWxwd3J6bnFicno0b2xzN3RweG15M3dzeTd4ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l378edm0oLZN1hmTK/giphy.gif' },
    { name: 'Squats', demo: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzFpeGNybzN4Z2pwMzU5czc5MGhseXZtc21qZWV1ZXp3bDUwc251byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2vlLAjOPXD3TccrMyp/giphy.gif' },
    { name: 'Deadlifts', demo: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2pqNTE4OXptMG1rN2NzNTR6Y2JicHE3cnBtZTVkcnM2MXlrZXEzZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xenc4lKQlhf1Ohi/giphy.gif' },
    { name: 'Pull-ups', demo: 'https://media.giphy.com/media/14xa1F3aatkNhK/giphy.gif?cid=790b7611kevwlrrzno8vqqz5nb0jwd9u81ddcqn2a8sxza2k&ep=v1_gifs_search&rid=giphy.gif&ct=g' },
    { name: 'Plank', demo: 'https://media.giphy.com/media/1etBJgfgDimAogaj6Z/giphy.gif?cid=790b7611kyhfe5id1t7b2xdwswtll2l30f7xvm2z6adzich4&ep=v1_gifs_search&rid=giphy.gif&ct=g' },
    { name: 'Lunges', demo: 'https://media.giphy.com/media/3oD3YLi7SKSQrTfnoY/giphy.gif?cid=790b7611ppl063501sqhii42kkawdzvlxq99l42mkhg7udmt&ep=v1_gifs_search&rid=giphy.gif&ct=g' },
    { name: 'Bench Press', demo: 'https://media.giphy.com/media/z1Suqc2f0GCPReDgUB/giphy.gif?cid=790b761127ulg7nntxa6bhtbq312duzpdcyhpeaaj8z1hvp0&ep=v1_gifs_search&rid=giphy.gif&ct=g' }
  ];
  res.json(library);
});

app.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ ...user.profile, _id: req.userId });
});

app.put('/profile', auth, async (req, res) => {
  const { weight, targetCalories, profilePic } = req.body;
  await User.updateOne(
    { _id: req.userId },
    { $set: { 'profile.weight': weight, 'profile.targetCalories': targetCalories, 'profile.profilePic': profilePic } }
  );
  res.send('Profile updated!');
});

app.get('/users', auth, async (req, res) => {
  const users = await User.find({}, 'name profile'); // No 'progress' in schema
  const workouts = await Workout.find();
  const userProgress = users.map(user => {
    const userWorkouts = workouts.filter(w => w.userId.toString() === user._id.toString());
    const caloriesBurned = userWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    return { ...user._doc, progress: { caloriesBurned } };
  });
  res.json(userProgress);
});

// Friend Endpoints
app.get('/friends', auth, async (req, res) => {
  const user = await User.findById(req.userId).populate('friends', 'name profile');
  const workouts = await Workout.find();
  const friendProgress = user.friends.map(friend => {
    const friendWorkouts = workouts.filter(w => w.userId.toString() === friend._id.toString());
    const caloriesBurned = friendWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    return { ...friend._doc, progress: { caloriesBurned } };
  });
  res.json(friendProgress);
});

app.post('/friends/request', auth, async (req, res) => {
  const { friendName } = req.body;
  const friend = await User.findOne({ name: friendName });
  if (!friend || friend._id.equals(req.userId)) return res.status(400).json({ error: 'Invalid friend' });
  if (!friend.friendRequests.includes(req.userId)) {
    friend.friendRequests.push(req.userId);
    await friend.save();
  }
  res.send('Friend request sent!');
});

app.post('/friends/accept', auth, async (req, res) => {
  const { friendId } = req.body;
  const user = await User.findById(req.userId);
  if (!user.friendRequests.includes(friendId)) return res.status(400).json({ error: 'No request found' });
  user.friends.push(friendId);
  user.friendRequests = user.friendRequests.filter(id => !id.equals(friendId));
  const friend = await User.findById(friendId);
  friend.friends.push(req.userId);
  await user.save();
  await friend.save();
  res.send('Friend request accepted!');
});

app.get('/friends/requests', auth, async (req, res) => {
  const user = await User.findById(req.userId).populate('friendRequests', 'name');
  res.json(user.friendRequests);
});

// Start server with dynamic port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});