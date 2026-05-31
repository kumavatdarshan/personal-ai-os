const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

router.post('/', async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const newGoal = new Goal({ title, description, deadline });
    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({});
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const updatedGoal = await Goal.findByIdAndUpdate(id, { progress }, { new: true });
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Goal.findByIdAndDelete(id);
    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;