const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

router.post('/', async (req, res) => {
  try {
    const { name, frequency } = req.body;
    if (!name) return res.status(400).json({ error: 'Habit name is required' });
    const newHabit = new Habit({ name, frequency });
    const savedHabit = await newHabit.save();
    res.status(201).json(savedHabit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({});
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);
    if (!habit) return res.status(404).json({ error: 'Habit not found' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alreadyDone = habit.completedDates.some((date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    if (alreadyDone) return res.status(400).json({ error: 'Already completed today' });
    habit.completedDates.push(today);
    habit.streak += 1;
    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Habit.findByIdAndDelete(id);
    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;