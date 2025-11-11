const express = require('express');
const Blog = require('../models/Blog');
const router = express.Router();

// GET all published blogs
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let query = { isPublished: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content'); // Don't send full content in list

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (!blog.isPublished) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET blog categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { isPublished: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADMIN ROUTES - Protected (add authentication middleware later)

// GET all blogs (including unpublished)
router.get('/admin/all', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE new blog
router.post('/admin/create', async (req, res) => {
  try {
    const blog = new Blog(req.body);
    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(400).json({ message: 'Error creating blog', error: error.message });
  }
});

// UPDATE blog
router.put('/admin/:id', async (req, res) => {
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
router.delete('/admin/:id', async (req, res) => {
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

module.exports = router;
