import { useState, useEffect } from 'react';
import axios from 'axios';

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

function HabitCalendar({ habit }) {
  const days = getLastNDays(30);
  const completedSet = new Set(
    (habit.completedDates || []).map(d => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );
  const todayTime = (() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  })();

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ fontSize: '10px', letterSpacing: '3px', color: '#666', marginBottom: '10px' }}>
        LAST 30 DAYS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', gap: '3px', marginBottom: '4px' }}>
        {days.map((day, i) => (
          <div key={i} style={{ fontSize: '8px', color: '#444', textAlign: 'center' }}>
            {i % 5 === 0 ? day.getDate() : ''}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', gap: '3px' }}>
        {days.map((day, i) => {
          const done = completedSet.has(day.getTime());
          const isToday = day.getTime() === todayTime;
          return (
            <div
              key={i}
              title={day.toDateString()}
              style={{
                aspectRatio: '1',
                background: done ? '#fff' : '#0d0d0d',
                border: isToday ? '1px solid #888' : done ? '1px solid #fff' : '1px solid #1a1a1a',
                borderRadius: '2px',
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '1px' }} />
          <span style={{ fontSize: '9px', color: '#666', letterSpacing: '1px' }}>DONE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '1px' }} />
          <span style={{ fontSize: '9px', color: '#666', letterSpacing: '1px' }}>MISSED</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', background: '#0d0d0d', border: '1px solid #888', borderRadius: '1px' }} />
          <span style={{ fontSize: '9px', color: '#666', letterSpacing: '1px' }}>TODAY</span>
        </div>
      </div>
    </div>
  );
}

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('daily');

  useEffect(() => { fetchHabits(); }, []);

  const fetchHabits = async () => {
    try {
      const res = await axios.get('${import.meta.env.VITE_API_URL}/api/habits');
      setHabits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addHabit = async () => {
    if (!name.trim()) return;
    try {
      await axios.post('${import.meta.env.VITE_API_URL}/api/habits', { name, frequency });
      setName('');
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const completeHabit = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/habits/${id}/complete`);
      fetchHabits();
    } catch {
      alert('Already completed today! Come back tomorrow 💪');
    }
  };

  const deleteHabit = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/habits/${id}`);
      setHabits(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDoneToday = (habit) =>
    habit.completedDates?.some(d => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    });

  const getConsistency = (habit) => {
    const days = getLastNDays(30);
    const completedSet = new Set(
      (habit.completedDates || []).map(d => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );
    const done = days.filter(d => completedSet.has(d.getTime())).length;
    return Math.round((done / 30) * 100);
  };

  const doneCount = habits.filter(isDoneToday).length;
  const pct = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;

  return (
    <div style={{ padding: '60px 40px', background: '#000', minHeight: '100vh' }}>

      <div style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-3px', marginBottom: '8px', lineHeight: '1', color: '#fff' }}>
        HABITS
      </div>
      <div style={{ fontSize: '11px', letterSpacing: '4px', color: '#888', marginBottom: '16px' }}>
        {doneCount} OF {habits.length} DONE TODAY — {pct}%
      </div>

      {/* Today progress bar */}
      {habits.length > 0 && (
        <div style={{ height: '1px', background: '#222', marginBottom: '60px' }}>
          <div style={{ height: '1px', background: '#fff', width: `${pct}%`, transition: 'width 0.5s ease' }} />
        </div>
      )}

      {/* Add form */}
      <div style={{ borderTop: '1px solid #222', paddingTop: '40px', marginBottom: '60px', maxWidth: '600px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', color: '#888', marginBottom: '24px' }}>
          NEW HABIT
        </div>
        <input
          type="text"
          placeholder="What habit will change your life?"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addHabit()}
          style={{
            width: '100%', background: 'none', border: 'none',
            borderBottom: '1px solid #333', color: '#fff', fontSize: '14px',
            padding: '12px 0', outline: 'none', fontFamily: 'inherit',
            marginBottom: '16px', boxSizing: 'border-box',
          }}
        />
        <select
          value={frequency}
          onChange={e => setFrequency(e.target.value)}
          style={{
            width: '100%', background: '#000', border: 'none',
            borderBottom: '1px solid #333', color: '#fff', fontSize: '14px',
            padding: '12px 0', outline: 'none', fontFamily: 'inherit',
            marginBottom: '24px', boxSizing: 'border-box', cursor: 'pointer',
            colorScheme: 'dark',
          }}
        >
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays</option>
          <option value="weekly">Weekly</option>
        </select>
        <button
          onClick={addHabit}
          style={{
            background: '#fff', border: 'none', color: '#000',
            fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
            padding: '14px 32px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700',
          }}
        >
          Add Habit →
        </button>
      </div>

      {/* Habits list */}
      <div style={{ borderTop: '1px solid #222' }}>
        {habits.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center', fontSize: '11px', letterSpacing: '4px', color: '#333' }}>
            NO HABITS YET — START SMALL, START TODAY
          </div>
        ) : (
          habits.map((habit, i) => {
            const done = isDoneToday(habit);
            const consistency = getConsistency(habit);
            return (
              <div key={habit._id} style={{ padding: '36px 0', borderBottom: '1px solid #111' }}>

                {/* Top row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr auto',
                  gap: '24px',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}>
                  <div style={{ fontSize: '12px', color: '#555', letterSpacing: '2px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  <div>
                    <div style={{
                      fontSize: '20px', fontWeight: '700',
                      color: '#fff',
                      textDecoration: done ? 'line-through' : 'none',
                      opacity: done ? 0.4 : 1,
                      marginBottom: '6px',
                    }}>
                      {habit.name}
                    </div>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase' }}>
                        {habit.frequency}
                      </span>
                      <span style={{ fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase' }}>
                        🔥 {habit.streak} DAY STREAK
                      </span>
                      <span style={{ fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase' }}>
                        {consistency}% CONSISTENT
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {done ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />
                        <span style={{ fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase' }}>
                          Done
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => completeHabit(habit._id)}
                        style={{
                          background: 'none', border: '1px solid #444', color: '#fff',
                          fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                          padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#fff'; }}
                      >
                        Mark Done
                      </button>
                    )}

                    <button
                      onClick={() => deleteHabit(habit._id)}
                      style={{
                        background: 'none', border: '1px solid #333', color: '#888',
                        fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                        padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888'; }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* 30 day calendar */}
                <div style={{ paddingLeft: '72px' }}>
                  <HabitCalendar habit={habit} />
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}