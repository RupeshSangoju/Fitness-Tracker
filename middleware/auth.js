const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Match your old server.js
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ msg: 'Invalid token' });
  }
};