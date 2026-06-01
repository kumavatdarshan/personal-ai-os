// generatePlan
const res = await axios.post('https://personal-ai-os-backend-1504.onrender.com/api/ai/daily-plan');

// fetchQuote
const res = await axios.get('https://personal-ai-os-backend-1504.onrender.com/api/ai/quote');

// fetchGoals
const res = await axios.get('https://personal-ai-os-backend-1504.onrender.com/api/goals');

// fetchHabits
const res = await axios.get('https://personal-ai-os-backend-1504.onrender.com/api/habits');

// fetchWeeklySummary
const res = await axios.get('https://personal-ai-os-backend-1504.onrender.com/api/ai/weekly-summary');

// sendChat
const res = await axios.post('https://personal-ai-os-backend-1504.onrender.com/api/ai/chat', { message: chatMsg });

// completeHabit
await axios.post(`https://personal-ai-os-backend-1504.onrender.com/api/habits/${id}/complete`);