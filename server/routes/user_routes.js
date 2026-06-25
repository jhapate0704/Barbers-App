const express = require('express');
const router = express.Router();
const User = require('../models/user_models.js'); // Import the blueprint
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/auth.js');

// POST ROUTE: Check if email exists
// URL: http://localhost:5000/api/users/check-email
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ message: 'Server error checking email' });
  }
});

// POST ROUTE: Register a new user (Customer or Salon Owner)
// URL: http://localhost:5000/api/users/register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 1. Grab the data sent from the frontend
    const { name, email, phone, password, country, role } = req.body;

    // 2. Check if a user with this email or phone already exists
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: 'User with this phone number already exists.' });
      }
    }

    // 3. Hash the password if provided
    let hashedPassword = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // 4. Create a new user using our model
    const newUser = new User({
      name,
      email: email ? email.toLowerCase() : undefined,
      phone,
      password: hashedPassword,
      country: country || 'India',
      role: role || 'customer' // Defaults to customer if no role is provided
    });

    // 5. Save the user to MongoDB
    const savedUser = await newUser.save();

    // 6. Send a success response back to the frontend
    const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'User created successfully!',
      user: savedUser,
      token
    });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
});

// POST ROUTE: Customer Login (Supports email/password or phone-based)
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    let user;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (phone) {
      user = await User.findOne({ phone });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first!' });
    }

    // Check password if it is registered in the DB
    if (user.password && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password. Please try again.' });
      }
    } else if (user.password && !password) {
      return res.status(400).json({ message: 'Password is required to log in.' });
    }
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      message: 'Logged in successfully',
      user,
      token
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// GET ROUTE: Fetch all users (Just for testing purposes right now)
// URL: http://localhost:5000/api/users
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const users = await User.find().select('-password').limit(limit).skip(skip); // Fetches everyone in the DB
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// GET ROUTE: Fetch single user by ID
// URL: http://localhost:5000/api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

// PUT ROUTE: Update User Notes (CRM)
router.put('/notes/update', verifyToken, async (req, res) => {
  try {
    const { userId, notes } = req.body;
    const user = await User.findByIdAndUpdate(userId, { notes }, { returnDocument: 'after' });
    res.status(200).json({ message: 'Notes updated!', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notes' });
  }
});

// ==========================================
// PUT ROUTE: Update Customer Profile & Settings
// URL: http://localhost:5000/api/users/profile/update
// ==========================================
router.put('/profile/update', verifyToken, [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId,
      name,
      avatar,
      email,
      phone,
      country,
      hairType,
      beardStyle,
      notifications,
      currentPassword,
      newPassword
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Password change validation
    if (newPassword) {
      if (user.password) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required to change password.' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password does not match.' });
        }
      }
      // Hash and update password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // 2. Email uniqueness check
    if (email && email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return res.status(400).json({ message: 'Email is already taken by another account.' });
      }
      user.email = email.toLowerCase();
    }

    // 3. Phone uniqueness check
    if (phone && phone !== user.phone) {
      const phoneTaken = await User.findOne({ phone });
      if (phoneTaken) {
        return res.status(400).json({ message: 'Phone number is already taken by another account.' });
      }
      user.phone = phone;
    }

    // 4. Other profile fields
    if (name !== undefined) user.name = name;
    if (country !== undefined) user.country = country;
    if (hairType !== undefined) user.hairType = hairType;
    if (beardStyle !== undefined) user.beardStyle = beardStyle;
    if (notifications !== undefined) user.notifications = notifications;

    // 5. Avatar upload
    if (avatar !== undefined) {
      if (avatar.startsWith('data:image')) {
        const { uploadToCloudinary } = require('../utils/cloudinary.js');
        const secureUrl = await uploadToCloudinary(avatar);
        user.avatar = secureUrl;
      } else {
        user.avatar = avatar;
      }
    }

    const savedUser = await user.save();
    res.status(200).json({ message: 'Profile updated successfully!', user: savedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: 'Error updating profile details' });
  }
});

module.exports = router;