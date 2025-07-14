import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { Express } from 'express';
import { storage } from './storage';

const SALT_ROUNDS = 12;

export function setupEmailAuth(app: Express) {
  // Register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, userType } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !userType) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const userId = randomUUID();
      const user = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        userType,
        authProvider: 'email',
        profileCompleted: true,
        hasSetPassword: true,
      });

      // Set password separately
      await storage.setUserPassword(userId, hashedPassword);

      // Create session
      req.login(user, (err) => {
        if (err) {
          console.error('Session creation error:', err);
          return res.status(500).json({ message: 'Failed to create session' });
        }
        
        res.status(201).json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          profileCompleted: user.profileCompleted,
          hasSetPassword: user.hasSetPassword,
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user has a password (might be Replit auth user)
      if (!user.password) {
        return res.status(401).json({ message: 'Please sign in with Replit or reset your password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Create session
      req.login(user, (err) => {
        if (err) {
          console.error('Session creation error:', err);
          return res.status(500).json({ message: 'Failed to create session' });
        }

        res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          profileCompleted: user.profileCompleted,
          hasSetPassword: user.hasSetPassword,
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = req.user as any;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      profileCompleted: user.profileCompleted,
      hasSetPassword: user.hasSetPassword,
      isAdmin: user.isAdmin,
    });
  });
}