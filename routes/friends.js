const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
} = require('../controllers/friendcontroller');

router.get('/', auth, getFriends);
router.get('/requests', auth, getFriendRequests);
router.post('/request', auth, sendFriendRequest);
router.post('/accept', auth, acceptFriendRequest);

module.exports = router;