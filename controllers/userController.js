const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workout = require('../models/Workout');

exports.signup = async (req, res) => {
  const { name, email, password, weight, targetCalories } = req.body;
  const profilePic = req.file ? `/Uploads/${req.file.filename}` : '';

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      profile: {
        weight: weight ? Number(weight) : undefined,
        targetCalories: targetCalories ? Number(targetCalories) : undefined,
        profilePic,
      },
      friends: [],
      friendRequests: [],
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name, email, profilePic } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Wrong password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, email, profilePic: user.profile.profilePic } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name profile');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ ...user.profile, _id: req.userId, name: user.name });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { weight, targetCalories, profilePic } = req.body;
  try {
    await User.updateOne(
      { _id: req.userId },
      {
        $set: {
          'profile.weight': weight ? Number(weight) : undefined,
          'profile.targetCalories': targetCalories ? Number(targetCalories) : undefined,
          'profile.profilePic': profilePic || '',
        },
      }
    );
    res.json({ msg: 'Profile updated!' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select('name profile');
    const workouts = await Workout.find();
    const userProgress = users.map((user) => {
      const userWorkouts = workouts.filter((w) => w.userId.toString() === user._id.toString());
      const caloriesBurned = userWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
      return { ...user.toObject(), progress: { caloriesBurned } };
    });
    res.json(userProgress);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};