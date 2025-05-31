const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const { signup, login, getProfile, updateProfile, getUsers } = require('../controllers/userController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/signup', upload.single('profilePic'), signup);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/users', auth, getUsers);

module.exports = router;