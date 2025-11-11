const express = require('express');
const { verifyToken } = require('./auth');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const User = require('../models/User');
const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(verifyToken);

// Check if user is admin or superadmin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Check if user is superadmin (for user management)
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Superadmin role required.' });
  }
  next();
};

// BLOG MANAGEMENT ROUTES

// GET all blogs (admin view - includes unpublished)
router.get('/blogs', requireAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE new blog
router.post('/blogs', requireAdmin, async (req, res) => {
  try {
    const blog = new Blog(req.body);
    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(400).json({ message: 'Error creating blog', error: error.message });
  }
});

// UPDATE blog
router.put('/blogs/:id', requireAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    res.status(400).json({ message: 'Error updating blog', error: error.message });
  }
});

// DELETE blog
router.delete('/blogs/:id', requireAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CONTACT MANAGEMENT ROUTES

// GET all contact inquiries
router.get('/contacts', requireAdmin, async (req, res) => {
  try {
    const inquiries = await Contact.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE contact inquiry (mark as read, etc.)
router.put('/contacts/:id', requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Error updating contact inquiry', error: error.message });
  }
});

// DELETE contact inquiry
router.delete('/contacts/:id', requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }

    res.json({ message: 'Contact inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// USER MANAGEMENT ROUTES (Superadmin only)

// GET all users
router.get('/users', requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE new admin user
router.post('/users', requireSuperAdmin, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = new User({
      email,
      password,
      name,
      role: role || 'admin'
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
});

// UPDATE user
router.put('/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    // If password is being updated, hash it
    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error: error.message });
  }
});

// DELETE user
router.delete('/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    // Prevent deleting self
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DASHBOARD STATS
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [blogCount, contactCount, userCount] = await Promise.all([
      Blog.countDocuments(),
      Contact.countDocuments(),
      User.countDocuments()
    ]);

    res.json({
      blogs: blogCount,
      contacts: contactCount,
      users: userCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
