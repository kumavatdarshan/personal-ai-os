const res = await axios.get('https://personal-ai-os-backend-1504.onrender.com/api/goals');

await axios.post('https://personal-ai-os-backend-1504.onrender.com/api/goals', { title, description, deadline });

await axios.patch(`https://personal-ai-os-backend-1504.onrender.com/api/goals/${id}/progress`, { progress: Number(progress) });

await axios.delete(`https://personal-ai-os-backend-1504.onrender.com/api/goals/${id}`);
