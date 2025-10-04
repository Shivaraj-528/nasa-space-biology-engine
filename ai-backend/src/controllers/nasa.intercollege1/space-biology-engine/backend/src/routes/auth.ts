import express from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Email domain to role mapping for verification
const domainRoleMap: { [key: string]: string[] } = {
  // Educational institutions
  'university.edu': ['STUDENT', 'TEACHER', 'RESEARCHER'],
  'college.edu': ['STUDENT', 'TEACHER'],
  'school.edu': ['STUDENT', 'TEACHER'],
  
  // Prestigious universities (all roles)
  'mit.edu': ['STUDENT', 'TEACHER', 'RESEARCHER', 'SCIENTIST'],
  'harvard.edu': ['STUDENT', 'TEACHER', 'RESEARCHER', 'SCIENTIST'],
  'stanford.edu': ['STUDENT', 'TEACHER', 'RESEARCHER', 'SCIENTIST'],
  'berkeley.edu': ['STUDENT', 'TEACHER', 'RESEARCHER', 'SCIENTIST'],
  'caltech.edu': ['STUDENT', 'TEACHER', 'RESEARCHER', 'SCIENTIST'],
  
  // Research institutions (research only)
  'nasa.gov': ['RESEARCHER', 'SCIENTIST'],
  'nih.gov': ['RESEARCHER', 'SCIENTIST'],
  'cern.ch': ['RESEARCHER', 'SCIENTIST'],
  'spacex.com': ['RESEARCHER', 'SCIENTIST'],
  
  // Generic email providers (student only)
  'gmail.com': ['STUDENT'],
  'yahoo.com': ['STUDENT'],
  'outlook.com': ['STUDENT'],
  'hotmail.com': ['STUDENT']
};

// Function to verify role based on email domain
function verifyRoleFromEmail(email: string, selectedRole: string) {
  const domain = email.split('@')[1]?.toLowerCase();
  const allowedRoles = domainRoleMap[domain] || ['STUDENT'];
  
  // If role is not allowed for this domain, suggest the highest available role
  if (!allowedRoles.includes(selectedRole)) {
    const roleHierarchy = ['STUDENT', 'TEACHER', 'RESEARCHER', 'SCIENTIST'];
    const suggestedRole = allowedRoles
      .sort((a, b) => roleHierarchy.indexOf(b) - roleHierarchy.indexOf(a))[0];
    
    return {
      verified: false,
      suggestedRole,
      allowedRoles,
      status: 'domain-enforced'
    };
  }
  
  return {
    verified: true,
    suggestedRole: selectedRole,
    allowedRoles,
    status: 'domain-verified'
  };
}

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
      });

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// @route   GET /api/auth/check
// @desc    Check if user is authenticated
// @access  Public
router.get('/check', (req, res) => {
  res.json({
    success: true,
    authenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

// @route   POST /api/auth/register
// @desc    Register new user with email/password
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User already exists' 
      });
    }

    // Verify role based on email domain
    const roleVerification = verifyRoleFromEmail(email, role || 'STUDENT');
    const finalRole = roleVerification.verified ? role : roleVerification.suggestedRole;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with verification data
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: finalRole as any,
        verification: {
          status: roleVerification.status,
          allowedRoles: roleVerification.allowedRoles,
          verifiedAt: new Date().toISOString()
        }
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verification: user.verification
      },
      roleVerification: {
        originalRole: role,
        finalRole: finalRole,
        wasEnforced: !roleVerification.verified,
        status: roleVerification.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with email/password
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verification: user.verification,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// @route   POST /api/auth/verify-role
// @desc    Verify role based on email domain
// @access  Public
router.post('/verify-role', async (req, res) => {
  try {
    const { email, role } = req.body;
    
    const verification = verifyRoleFromEmail(email, role);
    const domain = email.split('@')[1]?.toLowerCase();
    
    res.json({
      success: true,
      verification,
      domain
    });
  } catch (error) {
    console.error('Role verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

export default router;
