import { Request, Response, NextFunction } from 'express';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

export type UserRole = 'public_user' | 'researcher' | 'nasa_scientist' | 'administrator';

export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET: Secret = (process.env.JWT_SECRET || 'dev_jwt_secret_change_me') as Secret;

export const signToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn: SignOptions['expiresIn'] = '7d') => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload as object, JWT_SECRET, options);
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.substring(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
};
