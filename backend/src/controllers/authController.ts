import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { config } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth';

function generateToken(id: string): string {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Please provide name, email, and password.' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, error: 'An account with this email already exists.' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      preferences: {
        mockMode: true,
        defaultPlatformFilter: 'all',
        autoRefreshInterval: 15,
        theme: 'dark',
      },
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Please provide email and password.' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { mockMode, defaultPlatformFilter, autoRefreshInterval, theme } = req.body;

    if (mockMode !== undefined) user.preferences.mockMode = Boolean(mockMode);
    if (defaultPlatformFilter !== undefined) user.preferences.defaultPlatformFilter = defaultPlatformFilter;
    if (autoRefreshInterval !== undefined) user.preferences.autoRefreshInterval = Number(autoRefreshInterval);
    if (theme !== undefined) user.preferences.theme = theme;

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
