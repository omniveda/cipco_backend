const express = require('express');
const Contact = require('../models/Contact');
const router = express.Router();

// GET all contact inquiries
router.get('/', async (req, res) => {
  try {
    const inquiries = await Contact.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE new contact inquiry
router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    const savedContact = await contact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(400).json({ message: 'Error creating contact inquiry', error: error.message });
  }
});

// GET single contact inquiry by ID
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE contact inquiry
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

module.exports = router;
