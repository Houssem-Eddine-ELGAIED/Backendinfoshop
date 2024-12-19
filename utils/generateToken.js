import jwt from 'jsonwebtoken';

export const generateToken = (req, res, userId) => {
  // Generating a JWT token for the authenticated user
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {

    expiresIn: req.body.remember ? 365 * 24 + 'h' : '24h'

  });
  return token;


}
