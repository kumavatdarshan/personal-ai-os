import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/goals');
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addGoal = async () => {
    if (!title.trim()) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/goals', { title, description, deadline });
      setTitle(''); setDescription(''); setDeadline('');
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const updateProgress = async (id, progress) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/goals/${id}/progress`, { progress: Number(progress) });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/goals/${id}`);
      setGoals(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid #333',
    color: '#fff',
    fontSize: '14px',
    padding: '12px 0',
    outline: 'none',
    fontFamily: 'inherit',
    marginBottom: '16px',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '60px 40px', background: '#000', minHeight: '100vh' }}>

      <div style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-3px', marginBottom: '8px', lineHeight: '1', color: '#fff' }}>
        GOALS
      </div>
      <div style={{ fontSize: '11px', letterSpacing: '4px', color: '#888', marginBottom: '60px' }}>
        {goals.length} ACTIVE · {goals.filter(g => g.progress === 100).length} COMPLETED
      </div>

      {/* Add form */}
      <div style={{ borderTop: '1px solid #222', paddingTop: '40px', marginBottom: '60px', maxWidth: '600px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', color: '#888', marginBottom: '24px' }}>
          NEW GOAL
        </div>
        <input
          type="text"
          placeholder="What do you want to achieve?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addGoal()}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Why does this matter to you?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          style={{ ...inputStyle, colorScheme: 'dark' }}
        />
        <button
          onClick={addGoal}
          style={{
            background: '#fff', border: 'none', color: '#000',
            fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
            padding: '14px 32px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700',
          }}
        >
          Add Goal →
        </button>
      </div>

      {/* Goals list */}
      <div style={{ borderTop: '1px solid #222' }}>
        {goals.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center', fontSize: '11px', letterSpacing: '4px', color: '#333' }}>
            NO GOALS YET — ADD YOUR FIRST ONE ABOVE
          </div>
        ) : (
          goals.map((goal, i) => (
            <div key={goal._id} style={{
              padding: '36px 0',
              borderBottom: '1px solid #111',
              display: 'grid',
              gridTemplateColumns: '48px 1fr 100px',
              gap: '24px',
              alignItems: 'start',
            }}>

              {/* Number */}
              <div style={{ fontSize: '12px', color: '#555', letterSpacing: '2px', paddingTop: '6px' }}>
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Content */}
              <div>
                <div style={{
                  fontSize: '22px', fontWeight: '700', color: '#fff',
                  letterSpacing: '-0.5px', marginBottom: '6px',
                  textDecoration: goal.progress === 100 ? 'line-through' : 'none',
                  opacity: goal.progress === 100 ? 0.4 : 1,
                }}>
                  {goal.title}
                </div>

                {goal.description && (
                  <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px', lineHeight: '1.6' }}>
                    {goal.description}
                  </div>
                )}

                {goal.deadline && (
                  <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#666', marginBottom: '16px' }}>
                    DUE — {new Date(goal.deadline).toDateString().toUpperCase()}
                  </div>
                )}

                {/* Progress bar */}
                <div style={{ height: '1px', background: '#222', marginBottom: '10px' }}>
                  <div style={{
                    height: '1px', background: '#fff',
                    width: `${goal.progress}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <input
                  type="range" min="0" max="100"
                  value={goal.progress}
                  onChange={e => updateProgress(goal._id, e.target.value)}
                  style={{ width: '100%', accentColor: '#fff', cursor: 'pointer' }}
                />
                <div style={{ fontSize: '11px', color: '#666', marginTop: '6px', letterSpacing: '1px' }}>
                  Drag slider to update progress
                </div>
              </div>

              {/* Right side */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '44px', fontWeight: '800', letterSpacing: '-2px', lineHeight: '1', color: '#fff' }}>
                    {goal.progress}
                  </div>
                  <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#555', marginTop: '4px' }}>
                    PERCENT
                  </div>
                </div>

                <button
                  onClick={() => deleteGoal(goal._id)}
                  style={{
                    background: 'none',
                    border: '1px solid #333',
                    color: '#888',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#ff4444';
                    e.currentTarget.style.color = '#ff4444';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.color = '#888';
                  }}
                >
                  Delete
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}