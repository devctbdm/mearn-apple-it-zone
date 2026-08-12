// backend/src/controllers/authController.js

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import TeamMember from '../models/TeamMember.js';
import Session from '../models/Session.js';
import { parseUserAgent } from '../utils/parseUA.js';
import { sendPasswordResetOtp } from '../services/smsService.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const phoneRegex = (phone) => {
  const digits = String(phone).replace(/[^\d]/g, '');
  return new RegExp(`${digits.slice(-10)}$`);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user (password hashed automatically by User model pre-save hook)
    const user = new User({
      name,
      email,
      password,
      phone,
      address,
      role: 'customer', // default
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const email = req.body.email || identifier;
    const lookup = email.toLowerCase().trim();

    // 1) Try a regular customer/admin User account
    const user = await User.findOne({
      $or: [{ email: lookup }, { phone: email.trim() }],
    }).select('+password');

    if (user) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email/phone or password',
        });
      }
      // Generate token
      const token = generateToken(user._id);
      // Record session
      try {
        await Session.updateMany({ user: user._id }, { isCurrent: false });
        const ua = parseUserAgent(req.headers['user-agent'] || '');
        await Session.create({
          user: user._id,
          device: ua.device,
          browser: ua.browser,
          os: ua.os,
          ip: req.ip || req.connection?.remoteAddress || '',
          lastActive: new Date(),
          isCurrent: true,
        });
      } catch (e) {
        // non-blocking
      }
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          isTeam: false,
        },
      });
    }

    // 2) Try a TeamMember (staff / team collection)
    const member = await TeamMember.findOne({ email: lookup }).select('+password');
    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password',
      });
    }
    if (!member.active) {
      return res.status(403).json({
        success: false,
        message: 'This account is inactive. Contact an administrator.',
      });
    }
    const isMatch = await member.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password',
      });
    }

    // Generate token
    const token = generateToken(member._id);
    // Update last login time
    member.lastLogin = new Date();
    await member.save();

    res.json({
      success: true,
      token,
      user: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        phone: '',
        address: {},
        isTeam: true,
        active: member.active,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    if (req.isTeam) {
      return res.json({
        success: true,
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          phone: '',
          address: {},
          isTeam: true,
          active: req.user.active,
        },
      });
    }
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isTeam: false,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) {
      user.name = name;
    }
    if (phone) {
      user.phone = phone;
    }
    if (address) {
      if (address.street) {
        user.address.street = address.street;
      }
      if (address.city) {
        user.address.city = address.city;
      }
      if (address.state) {
        user.address.state = address.state;
      }
      if (address.postcode) {
        user.address.postcode = address.postcode;
      }
      if (address.country) {
        user.address.country = address.country;
      }
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a password reset OTP via SMS
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const user = await User.findOne({ phone: phoneRegex(phone) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number',
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetPasswordToken = hashOtp(otp);
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const result = await sendPasswordResetOtp({ phone: user.phone, otp });
    if (result.skipped || !result.success) {
      console.error('Forgot password SMS failed:', result.reason || result.log?.providerMessage);
      return res.status(500).json({
        success: false,
        message: 'Could not send the code. SMS service is not configured or is unavailable.',
      });
    }

    res.json({ success: true, message: 'OTP sent to your phone' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password with the SMS OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'phone, otp and newPassword are required',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const user = await User.findOne({ phone: phoneRegex(phone) }).select('+password');
    if (!user || !user.resetPasswordToken) {
      return res.status(400).json({
        success: false,
        message: 'No password reset was requested for this phone',
      });
    }
    if (!user.resetPasswordExpire || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Request a new code.',
      });
    }
    if (user.resetPasswordToken !== hashOtp(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all saved addresses of logged-in user
// @route   GET /api/auth/me/addresses
// @access  Private
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, addresses: user.addresses || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new saved address
// @route   POST /api/auth/me/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const { label, fullName, phone, street, city, state, postcode, country } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFirst = user.addresses.length === 0;
    user.addresses.push({
      label: label || 'Home',
      fullName: fullName || user.name,
      phone: phone || user.phone,
      street: street || '',
      city: city || '',
      state: state || '',
      postcode: postcode || '',
      country: country || 'Bangladesh',
      isDefault: isFirst,
    });

    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a saved address
// @route   PUT /api/auth/me/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, fullName, phone, street, city, state, postcode, country } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (label !== undefined) address.label = label;
    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (postcode !== undefined) address.postcode = postcode;
    if (country !== undefined) address.country = country;

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a saved address
// @route   DELETE /api/auth/me/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const wasDefault = address.isDefault;
    address.deleteOne();
    await user.save();

    // If the deleted address was default, promote the first remaining one
    if (wasDefault && user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
      await user.save();
    }

    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set an address as default
// @route   PUT /api/auth/me/addresses/:id/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    user.addresses.forEach((a) => { a.isDefault = a._id.toString() === id; });
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
