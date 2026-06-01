import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://personal-ai-os-backend-1504.onrender.com';

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(new Date(d));
  }
  return days;
}

function HabitCalendar({ habit, isMobile }) {
  const days = getLastNDays(isMobile ? 14 : 30);
  const completedSet = new Set(
    (habit.completedDates || []).map(d => {
      const date = new Date(d); date.setHours(0, 0, 0, 0); return date.getTime();
    })
  );
  const todayTime = (() => { const t = new Date(); t.setHours(0,0,0,0); return t.getTime(); })();
  const cols = isMobile ? 14 : 30;

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '3px', color: '#555', marginBottom: '8px' }}>
        LAST {cols} DAYS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + cols + ', 1fr)', gap: '3px' }}>
        {days.map((day, i) => {
          const done = completedSet.has(day.getTime());
          const isToday = day.getTime() === todayTime;
          return (
            <div key={i} title={day.toDateString()} style={{
              aspectRatio: '1', background: done ? '#fff' : '#0d0d0d',
              border: isToday ? '1px solid #888' : done ? '1px solid #fff' : '1px solid #1a1a1a',
              borderRadius: '2px',
            }} />
          );
        })}
      </div>
    </div>
  );
}

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const isMobile = window.innerWidth < 768;
  const pad = isMobile ? '20px' : '40px';

  useEffect(() => { fetchHabits(); }, []);

  const fetchHabits = async () => {
    try {
      const res = await axios.get(API + '/api/habits');
      setHabits(res.data);
    } catch (err) { console.error(err); }
  };

  const addHabit = async () => {
    if (!name.trim()) return;
    try {
      await axios.post(API + '/api/habits', { name, frequency });
      setName(''); fetchHabits();
    } catch (err) { console.error(err); }
  };

  const completeHabit = async (id) => {
    try {
      await axios.post(API + '/api/habits/' + id + '/complete');
      fetchHabits();
    } catch { alert('Already completed today!'); }
  };

  const deleteHabit = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await axios.delete(API + '/api/habits/' + id);
      setHabits(prev => prev.filter(h => h._id !== id));
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDoneToday = (habit) =>
    habit.completedDates?.some(d => {
      const date = new Date(d); date.setHours(0,0,0,0);
      return date.getTime() === today.getTime();
    });

  const getConsistency = (habit) => {
    const n = isMobile ? 14 : 30;
    const days = getLastNDays(n);
    const completedSet = new Set((habit.completedDates || []).map(d => {
      const date = new Date(d); date.setHours(0,0,0,0); return date.getTime();
    }));
    return Math.round((days.filter(d => completedSet.has(d.getTime())).length / n) * 100);
  };

  const doneCount = habits.filter(isDoneToday).length;
  const pct = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;

  return (
    <div style={{ padding: '40px ' + pad, background: '#000', minHeight: '100vh' }}>
      <div style={{ fontSize: isMobile ? '36px' : '48px', fontWeight: '800', letterSpacing: '-3px', marginBottom: '8px', lineHeight: '1', color: '#fff' }}>
        HABITS
      </div>
      <div style={{ fontSize: '11px', letterSpacing: '4px', color: '#888', marginBottom: '16px' }}>
        {doneCount} OF {habits.length} DONE TODAY — {pct}%
      </div>

      {habits.length > 0 && (
        <div style={{ height: '1px', background: '#222', marginBottom: '40px' }}>
          <div style={{ height: '1px', background: '#fff', width: pct + '%', transition: 'width 0.5s ease' }} />
        </div>
      )}

      <div style={{ borderTop: '1px solid #222', paddingTop: '32px', marginBottom: '48px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', color: '#888', marginBottom: '24px' }}>NEW HABIT</div>
        <input type="text" placeholder="What habit will change your life?" value={name}
          onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHabit()}
          style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid #333',
            color: '#fff', fontSize: '14px', padding: '12px 0', outline: 'none',
            fontFamily: 'inherit', marginBottom: '16px', boxSizing: 'border-box' }} />
        <select value={frequency} onChange={e => setFrequency(e.target.value)}
          style={{ width: '100%', background: '#000', border: 'none', borderBottom: '1px solid #333',
            color: '#fff', fontSize: '14px', padding: '12px 0', outline: 'none',
            fontFamily: 'inherit', marginBottom: '24px', boxSizing: 'border-box',
            cursor: 'pointer', colorScheme: 'dark' }}>
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays</option>
          <option value="weekly">Weekly</option>
        </select>
        <button onClick={addHabit} style={{
          background: '#fff', border: 'none', color: '#000', fontSize: '11px',
          letterSpacing: '3px', textTransform: 'uppercase', padding: '14px 32px',
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700',
        }}>Add Habit →</button>
      </div>

      <div style={{ borderTop: '1px solid #222' }}>
        {habits.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', fontSize: '11px', letterSpacing: '4px', color: '#333' }}>
            NO HABITS YET — START TODAY
          </div>
        ) : (
          habits.map((habit, i) => {
            const done = isDoneToday(habit);
            const consistency = getConsistency(habit);
            return (
              <div key={habit._id} style={{ padding: '28px 0', borderBottom: '1px solid #111' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ flex: 1, marginRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#444', letterSpacing: '2px' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{
                        fontSize: isMobile ? '16px' : '20px', fontWeight: '700', color: '#fff',
                        textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.4 : 1,
                      }}>
                        {habit.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#666', textTransform: 'uppercase' }}>
                        {habit.frequency}
                      </span>
                      <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#666', textTransform: 'uppercase' }}>
                        🔥 {habit.streak} STREAK
                      </span>
                      <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#666', textTransform: 'uppercase' }}>
                        {consistency}% CONSISTENT
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    {done ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />
                        <span style={{ fontSize: '10px', color: '#666', letterSpacing: '1px' }}>DONE</span>
                      </div>
                    ) : (
                      <button onClick={() => completeHabit(habit._id)} style={{
                        background: 'none', border: '1px solid #444', color: '#fff',
                        fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                        padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#fff'; }}
                      >Done</button>
                    )}
                    <button onClick={() => deleteHabit(habit._id)} style={{
                      background: 'none', border: '1px solid #333', color: '#666',
                      fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                      padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#666'; }}
                    >Del</button>
                  </div>
                </div>
                <HabitCalendar habit={habit} isMobile={isMobile} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}