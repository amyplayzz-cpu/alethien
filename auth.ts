import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { User } from '@shared/schema';
import { db } from './db';
import { storage } from './storage';
import connectPgSimple from 'connect-pg-simple';

// Number of rounds for bcrypt (higher = more secure but slower)
const SALT_ROUNDS = 10;

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Configure session
export function configureSession(app: any) {
  const PgSession = connectPgSimple(session);
  
  app.use(
    session({
      store: new PgSession({
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        tableName: 'sessions',
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || 'alethien_secret', // In production, always use env variable
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      },
    })
  );
}

// Define types for session
declare module 'express-session' {
  interface SessionData {
    user: {
      id: number;
      username: string;
      displayName: string;
      role: string;
    };
  }
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized - Please log in' });
}

// Middleware to check if user has specific role
export function hasRole(role: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    const roles = Array.isArray(role) ? role : [role];
    if (roles.includes(req.session.user.role)) {
      return next();
    }

    res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
  };
}

// Get current authenticated user
export function getCurrentUser(req: Request): User | null {
  return req.session?.user ? req.session.user : null;
}