import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Récupérer le token depuis le header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Non autorisé - Token manquant',
      });
      return;
    }

    try {
      // Vérifier le token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'votre_secret_jwt_super_secret'
      ) as { id: string };

      // Récupérer l'utilisateur depuis la base de données
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
        return;
      }

      // Attacher l'utilisateur à la requête
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification',
    });
  }
};
