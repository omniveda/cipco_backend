const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: String,
    default: ''
  },
  response: {
    message: String,
    respondedBy: String,
    respondedAt: Date
  },
  source: {
    type: String,
    default: 'website'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1, priority: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ name: 'text', email: 'text', message: 'text' });

module.exports = mongoose.model('Contact', contactSchema);
