const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better query performance
teamSchema.index({ name: 'text' });
teamSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Team', teamSchema);
