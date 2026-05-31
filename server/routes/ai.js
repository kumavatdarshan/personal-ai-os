const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────
// ROUTE 1: Generate powerful daily plan
// ─────────────────────────────────────────
router.post('/daily-plan', async (req, res) => {
  try {
    const goals = await Goal.find({ status: 'active' });
    const habits = await Habit.find({});

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    // Calculate which habits were done today
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const habitsWithStatus = habits.map(h => {
      const doneToday = h.completedDates.some(d => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === todayDate.getTime();
      });
      return {
        name: h.name,
        streak: h.streak,
        frequency: h.frequency,
        doneToday,
      };
    });

    // Find goals close to deadline (within 7 days)
    const urgentGoals = goals.filter(g => {
      if (!g.deadline) return false;
      const daysLeft = Math.ceil(
        (new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return daysLeft <= 7 && daysLeft > 0;
    });

    // Find goals with low progress
    const strugglingGoals = goals.filter(g => g.progress < 30);

    // Build rich context
    const goalsText = goals.length > 0
      ? goals.map(g => {
          const daysLeft = g.deadline
            ? Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24))
            : null;
          return `- "${g.title}" | progress: ${g.progress}% | ${daysLeft !== null ? `${daysLeft} days left` : 'no deadline'}`;
        }).join('\n')
      : 'No goals set yet';

    const habitsText = habitsWithStatus.length > 0
      ? habitsWithStatus.map(h =>
          `- "${h.name}" | streak: ${h.streak} days | ${h.doneToday ? '✅ done today' : '⏳ not done yet'}`
        ).join('\n')
      : 'No habits tracked yet';

    const urgentText = urgentGoals.length > 0
      ? `URGENT: These goals are due within 7 days: ${urgentGoals.map(g => g.title).join(', ')}`
      : '';

    const struggleText = strugglingGoals.length > 0
      ? `NEEDS ATTENTION: These goals have very low progress: ${strugglingGoals.map(g => g.title).join(', ')}`
      : '';

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are not just an AI. You are the user's most trusted life coach, 
          personal trainer, and chief of staff combined into one.
          
          Your tone is: warm, direct, deeply motivating, and personal.
          You speak like someone who genuinely cares about this person's success.
          You never give generic advice. Every word is specific to THEIR goals and habits.
          
          You know that most people give up not because they lack ability, 
          but because they lose momentum and forget their WHY.
          Your job is to reignite that fire every single morning.
          
          Format your response with these exact sections using emojis:
          🌅 GOOD MORNING (2-3 sentences, personal and energizing)
          🎯 YOUR TOP 3 PRIORITIES TODAY (specific actions, not vague goals)
          ⚡ POWER HOUR PLAN (a simple time-blocked schedule)
          🔥 HABIT CHECK (comment on each habit and their streak)
          💪 YOUR MOMENTUM MESSAGE (1 powerful paragraph about their overall progress)
          🌟 TODAY'S CHALLENGE (one specific thing to push them further)`,
        },
        {
          role: 'user',
          content: `Today is ${today}.

MY GOALS:
${goalsText}

${urgentText}
${struggleText}

MY HABITS:
${habitsText}

Generate my daily plan. Make it feel personal, powerful, and make me want to 
jump out of my seat and take action. Reference my specific goals and habits by name.
Make me feel like today is the most important day for my growth.`,
        },
      ],
      max_tokens: 1500,
    });

    const plan = chatCompletion.choices[0].message.content;
    res.json({ plan, date: today });

  } catch (error) {
    console.log('AI error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// ROUTE 2: Get a daily motivational quote
// ─────────────────────────────────────────
router.get('/quote', async (req, res) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Give me one powerful, original motivational quote for someone 
          working hard on their goals today. 
          Make it short (1-2 sentences), punchy, and deeply meaningful.
          Only return the quote and the author name (if real) or just the quote.
          No extra text, no explanation.`,
        },
      ],
      max_tokens: 100,
    });

    const quote = chatCompletion.choices[0].message.content;
    res.json({ quote });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// ROUTE 3: Chat with AI assistant
// ─────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const goals = await Goal.find({ status: 'active' });
    const habits = await Habit.find({});

    const goalsText = goals.map(g => `- ${g.title} (${g.progress}% done)`).join('\n');
    const habitsText = habits.map(h => `- ${h.name} (streak: ${h.streak} days)`).join('\n');

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a personal AI life coach. 
          User's goals: ${goalsText || 'none yet'}
          User's habits: ${habitsText || 'none yet'}
          Be warm, specific, and motivating. Keep answers concise.`,
        },
        { role: 'user', content: message },
      ],
      max_tokens: 512,
    });

    const reply = chatCompletion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// ROUTE 4: Get weekly progress summary
// ─────────────────────────────────────────
router.get('/weekly-summary', async (req, res) => {
  try {
    const goals = await Goal.find({});
    const habits = await Habit.find({});

    // Count completions in last 7 days for each habit
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const habitStats = habits.map(h => {
      const completionsThisWeek = h.completedDates.filter(
        d => new Date(d) >= sevenDaysAgo
      ).length;
      return {
        name: h.name,
        completionsThisWeek,
        streak: h.streak,
        // consistency = how many times done vs how many times expected (7)
        consistency: Math.round((completionsThisWeek / 7) * 100),
      };
    });

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a supportive life coach giving a weekly review. 
          Be encouraging but honest. Celebrate wins. Gently address struggles.
          Keep it under 150 words.`,
        },
        {
          role: 'user',
          content: `Here's my week:
          
Goals: ${goals.map(g => `${g.title}: ${g.progress}%`).join(', ')}

Habit performance this week:
${habitStats.map(h => `- ${h.name}: done ${h.completionsThisWeek}/7 days (${h.consistency}% consistent)`).join('\n')}

Give me an honest, motivating weekly review in 3-4 sentences.`,
        },
      ],
      max_tokens: 300,
    });

    const summary = chatCompletion.choices[0].message.content;
    res.json({ summary, habitStats });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;