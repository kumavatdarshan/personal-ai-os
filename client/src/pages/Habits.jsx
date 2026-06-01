const res = await axios.get('https://personal-ai-os-backend-1504.onrender.com/api/habits');

await axios.post('https://personal-ai-os-backend-1504.onrender.com/api/habits', { name, frequency });

await axios.post(`https://personal-ai-os-backend-1504.onrender.com/api/habits/${id}/complete`);

await axios.delete(`https://personal-ai-os-backend-1504.onrender.com/api/habits/${id}`);