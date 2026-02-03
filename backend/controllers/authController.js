import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getMailer } from '../config/email.js';
import { successResponse, errorResponse } from '../views/response.js';

const otpStore = new Map();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return errorResponse(res, 'All fields are required');
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User already exists');
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);

    return successResponse(res, 'User created successfully', {
      token,
      user: { id: user._id, name: user.name, email: user.email }
    }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials');
    }

    const token = generateToken(user._id);

    return successResponse(res, 'Login successful', {
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, 'Profile retrieved', { user });
  } catch (error) {
    console.error('Profile error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();
    
    otpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Your OTP for password reset is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `
    };

    const transporter = getMailer();
    await transporter.sendMail(mailOptions);
    return successResponse(res, 'OTP sent successfully');
  } catch (error) {
    console.error('Error sending OTP:', error);
    return errorResponse(res, 'Failed to send OTP', 500);
  }
};

export const verifyOTP = (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedData = otpStore.get(email);

    if (!storedData) {
      return errorResponse(res, 'OTP not found');
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(email);
      return errorResponse(res, 'OTP expired');
    }

    if (storedData.otp !== otp) {
      return errorResponse(res, 'Invalid OTP');
    }

    return successResponse(res, 'OTP verified successfully');
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return errorResponse(res, 'Failed to verify OTP', 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const storedData = otpStore.get(email);

    if (!storedData || storedData.otp !== otp) {
      return errorResponse(res, 'Invalid OTP');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.password = newPassword;
    await user.save();
    
    otpStore.delete(email);
    
    return successResponse(res, 'Password reset successfully');
  } catch (error) {
    console.error('Error resetting password:', error);
    return errorResponse(res, 'Failed to reset password', 500);
  }
};