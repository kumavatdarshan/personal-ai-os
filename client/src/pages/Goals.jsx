import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://personal-ai-os-backend-1504.onrender.com';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const isMobile = window.innerWidth < 768;
  const pad = isMobile ? '20px' : '40px';

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get(API + '/api/goals');
      setGoals(res.data);
    } catch (err) { console.error(err); }
  };

  const addGoal = async () => {
    if (!title.trim()) return;
    try {
      await axios.post(API + '/api/goals', { title, description, deadline });
      setTitle(''); setDescription(''); setDeadline('');
      fetchGoals();
    } catch (err) { console.error(err); }
  };

  const updateProgress = async (id, progress) => {
    try {
      await axios.patch(API + '/api/goals/' + id + '/progress', { progress: Number(progress) });
      fetchGoals();
    } catch (err) { console.error(err); }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await axios.delete(API + '/api/goals/' + id);
      setGoals(prev => prev.filter(g => g._id !== id));
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const inputStyle = {
    width: '100%', background: 'none', border: 'none',
    borderBottom: '1px solid #333', color: '#fff', fontSize: '14px',
    padding: '12px 0', outline: 'none', fontFamily: 'inherit',
    marginBottom: '16px', boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '40px ' + pad, background: '#000', minHeight: '100vh' }}>
      <div style={{ fontSize: isMobile ? '36px' : '48px', fontWeight: '800', letterSpacing: '-3px', marginBottom: '8px', lineHeight: '1', color: '#fff' }}>
        GOALS
      </div>
      <div style={{ fontSize: '11px', letterSpacing: '4px', color: '#888', marginBottom: '40px' }}>
        {goals.length} ACTIVE · {goals.filter(g => g.progress === 100).length} COMPLETED
      </div>

      <div style={{ borderTop: '1px solid #222', paddingTop: '32px', marginBottom: '48px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', color: '#888', marginBottom: '24px' }}>NEW GOAL</div>
        <input type="text" placeholder="What do you want to achieve?" value={title}
          onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGoal()} style={inputStyle} />
        <input type="text" placeholder="Why does this matter to you?" value={description}
          onChange={e => setDescription(e.target.value)} style={inputStyle} />
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
          style={{ ...inputStyle, colorScheme: 'dark' }} />
        <button onClick={addGoal} style={{
          background: '#fff', border: 'none', color: '#000', fontSize: '11px',
          letterSpacing: '3px', textTransform: 'uppercase', padding: '14px 32px',
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700',
        }}>Add Goal →</button>
      </div>

      <div style={{ borderTop: '1px solid #222' }}>
        {goals.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', fontSize: '11px', letterSpacing: '4px', color: '#333' }}>
            NO GOALS YET
          </div>
        ) : (
          goals.map((goal, i) => (
            <div key={goal._id} style={{ padding: '28px 0', borderBottom: '1px solid #111' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1, marginRight: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#444', letterSpacing: '2px' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{
                      fontSize: isMobile ? '18px' : '22px', fontWeight: '700', color: '#fff',
                      textDecoration: goal.progress === 100 ? 'line-through' : 'none',
                      opacity: goal.progress === 100 ? 0.4 : 1,
                    }}>
                      {goal.title}
                    </span>
                  </div>
                  {goal.description && (
                    <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', lineHeight: '1.6' }}>
                      {goal.description}
                    </div>
                  )}
                  {goal.deadline && (
                    <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#555' }}>
                      DUE — {new Date(goal.deadline).toDateString().toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: isMobile ? '32px' : '40px', fontWeight: '800', letterSpacing: '-2px', lineHeight: '1', color: '#fff' }}>
                      {goal.progress}
                    </div>
                    <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#555' }}>%</div>
                  </div>
                  <button onClick={() => deleteGoal(goal._id)} style={{
                    background: 'none', border: '1px solid #333', color: '#888',
                    fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase',
                    padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888'; }}
                  >Delete</button>
                </div>
              </div>
              <div style={{ height: '1px', background: '#222', marginBottom: '10px' }}>
                <div style={{ height: '1px', background: '#fff', width: goal.progress + '%', transition: 'width 0.5s ease' }} />
              </div>
              <input type="range" min="0" max="100" value={goal.progress}
                onChange={e => updateProgress(goal._id, e.target.value)}
                style={{ width: '100%', accentColor: '#fff', cursor: 'pointer' }} />
              <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>Drag to update progress</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}