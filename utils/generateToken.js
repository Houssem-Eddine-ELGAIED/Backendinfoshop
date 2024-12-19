import jwt from 'jsonwebtoken';

export const generateToken = (req, res, userId) => {
  try {
    // Générer le token JWT
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: req.body.remember ? '365d' : '24h' // Durée configurable
    });

    // Retourner le token dans la réponse JSON
    res.status(200).json({
      message: 'Token généré avec succès',
      token // Retourne le token au client
    });
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error);
    res.status(500).json({ error: 'Erreur interne lors de la génération du token' });
  }
};
