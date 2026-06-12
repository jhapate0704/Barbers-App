// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Check if the token is in the headers
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    // Remove "Bearer " from the string if it exists
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7, token.length).trimLeft() : token;
    
    // Verify the token using your secret key
    const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    // Attach the user payload to the request so the next route can use it
    req.user = verified; 
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = verifyToken;