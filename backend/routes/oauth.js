import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.error('OAuth error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
      }
      
      if (!user) {
        console.error('No user returned from OAuth');
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
      }
      
      try {
        const token = jwt.sign(
          { userId: user._id }, 
          process.env.JWT_SECRET, 
          { expiresIn: '7d' }
        );
        
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
      } catch (error) {
        console.error('Token generation error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login`);
      }
    })(req, res, next);
  }
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  (req, res, next) => {
    passport.authenticate('github', (err, user, info) => {
      if (err) {
        console.error('OAuth error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
      }
      
      if (!user) {
        console.error('No user returned from OAuth');
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
      }
      
      try {
        const token = jwt.sign(
          { userId: user._id }, 
          process.env.JWT_SECRET, 
          { expiresIn: '7d' }
        );
        
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
      } catch (error) {
        console.error('Token generation error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login`);
      }
    })(req, res, next);
  }
);

export default router;