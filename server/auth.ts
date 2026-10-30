import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db, User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'omnimind-super-secret-jwt-key-2026';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  role: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    full_name: string;
    role?: string;
  };
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Check if fallback to demo user is allowed for seamless exploration
      const demoUser = db.findUserByEmail('demo@omnimind.ai');
      if (demoUser) {
        req.user = {
          id: demoUser.id,
          email: demoUser.email,
          full_name: demoUser.full_name,
          role: demoUser.role,
        };
        return next();
      }
      return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      full_name: string;
      role?: string;
    };

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hashed: string): Promise<boolean> {
  // Allow demo account quick comparison if bcrypt matches or demo default
  if (hashed.startsWith('$2a$') || hashed.startsWith('$2b$')) {
    return bcrypt.compare(plainText, hashed);
  }
  return plainText === hashed;
}
