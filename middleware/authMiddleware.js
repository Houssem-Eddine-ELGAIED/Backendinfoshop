import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Middleware to protect routes by verifying the JWT token.
const protect = async (req, res, next) => {
  try {
    // Extract token from the Authorization header (Bearer <token>)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication failed: Token not provided or invalid.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    // Verify the JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Authentication failed: Invalid or expired token.' });
    }

    // Attach user to the request object using the userId from the token.
    req.user = await User.findById(decodedToken.userId).select('-password');

    // If no user is found, respond with an error.
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication failed: User not found.' });
    }

    // Proceed to the next middleware or route handler.
    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Internal Server Error while authenticating.'
    });
  }
};

// Middleware to check if the user is an admin.
const admin = (req, res, next) => {
  try {
    // Check if the authenticated user has admin privileges.
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Authorization failed: Not authorized as an admin.' });
    }

    // Proceed to the next middleware or route handler.
    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Internal Server Error while checking admin privileges.'
    });
  }
};

export { protect, admin };
