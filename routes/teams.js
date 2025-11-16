const express = require('express');
const Team = require('../models/Team');
const router = express.Router();

// GET all teams (public route)
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
