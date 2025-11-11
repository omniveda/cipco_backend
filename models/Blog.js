const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    default: 'Admin'
  },
  category: {
    type: String,
    required: true,
    enum: ['Research', 'Sustainability', 'Innovation', 'Future', 'Quality', 'Global Health']
  },
  image: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
blogSchema.index({ title: 'text', content: 'text', summary: 'text' });
blogSchema.index({ category: 1, isPublished: 1 });
blogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
