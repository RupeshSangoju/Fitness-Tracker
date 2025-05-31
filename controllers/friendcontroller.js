const User = require('../models/User');
const Workout = require('../models/Workout');

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('friends', 'name profile');
    const workouts = await Workout.find();
    const friendProgress = user.friends.map((friend) => {
      const friendWorkouts = workouts.filter((w) => w.userId.toString() === friend._id.toString());
      const caloriesBurned = friendWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
      return { ...friend.toObject(), progress: { caloriesBurned } };
    });
    res.json(friendProgress);
  } catch (err) {
    console.error('Get friends error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('friendRequests', 'name profile');
    res.json(user.friendRequests);
  } catch (err) {
    console.error('Get friend requests error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.sendFriendRequest = async (req, res) => {
  const { friendId } = req.body;
  try {
    const user = await User.findById(req.userId);
    const friend = await User.findById(friendId);

    if (!friend || friend._id.equals(req.userId)) {
      return res.status(400).json({ msg: 'Invalid friend' });
    }
    if (user.friends.includes(friendId) || friend.friendRequests.includes(req.userId)) {
      return res.status(400).json({ msg: 'Already friends or request pending' });
    }

    friend.friendRequests.push(req.userId);
    await friend.save();
    res.json({ msg: 'Friend request sent!' });
  } catch (err) {
    console.error('Send friend request error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  const { friendId } = req.body;
  try {
    const user = await User.findById(req.userId);
    const friend = await User.findById(friendId);

    if (!friend || !user.friendRequests.includes(friendId)) {
      return res.status(400).json({ msg: 'No friend request found' });
    }

    user.friends.push(friendId);
    friend.friends.push(req.userId);
    user.friendRequests = user.friendRequests.filter((id) => !id.equals(friendId));

    await user.save();
    await friend.save();
    res.json({ msg: 'Friend request accepted!' });
  } catch (err) {
    console.error('Accept friend request error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};