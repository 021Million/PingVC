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
        return res.status(401).json({ message: 'User not found. Please sign up first or check your email address.' });
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

  // Update profile endpoint
  app.put('/api/auth/profile', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = req.user as any;
      const { firstName, lastName, email, newPassword } = req.body;

      // Validate required fields
      if (!firstName || !lastName) {
        return res.status(400).json({ message: 'First name and last name are required' });
      }

      // Update profile with or without password
      let updatedUser;
      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        updatedUser = await storage.updateUserAndPassword(user.id, { firstName, lastName, email }, hashedPassword);
      } else {
        updatedUser = await storage.updateUserProfile(user.id, { firstName, lastName, email });
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        userType: updatedUser.userType,
        profileCompleted: updatedUser.profileCompleted,
        hasSetPassword: updatedUser.hasSetPassword,
        isAdmin: updatedUser.isAdmin,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Delete account endpoint
  app.delete('/api/auth/delete-account', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = req.user as any;
      
      // Delete user from database
      await storage.deleteUser(user.id);
      
      // Log out the user
      req.logout((err) => {
        if (err) {
          console.error('Logout error during account deletion:', err);
          return res.status(500).json({ message: 'Account deleted but logout failed' });
        }
        res.json({ message: 'Account deleted successfully' });
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: 'Failed to delete account' });
    }
  });
}