import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://personal-ai-os-backend-1504.onrender.com';

function PlanBlock({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div>
      {lines.map((line, i) => {
        const isHeader = /^[🌅🎯⚡🔥💪🌟]/.test(line);
        const isEmpty = line.trim() === '';
        if (isEmpty) return <div key={i} style={{ height: '12px' }} />;
        if (isHeader) return (
          <div key={i} style={{
            fontSize: '11px', fontWeight: '700', letterSpacing: '2px',
            textTransform: 'uppercase', color: '#fff', marginTop: '24px',
            marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid #fff',
          }}>
            {line}
          </div>
        );
        return (
          <p key={i} style={{
            fontSize: '14px', color: '#fff', lineHeight: '1.8', paddingLeft: '12px',
          }}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState('');
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [chatReply, setChatReply] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [typed, setTyped] = useState('');
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('daily-tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date !== new Date().toDateString()) {
          return { date: new Date().toDateString(), items: [] };
        }
        return parsed;
      }
    } catch {}
    return { date: new Date().toDateString(), items: [] };
  });
  const [newTask, setNewTask] = useState('');

  // detect mobile
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    localStorage.setItem('daily-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    generatePlan();
    fetchQuote();
    fetchGoals();
    fetchHabits();
    fetchWeeklySummary();
  }, []);

  useEffect(() => {
    const greeting = getDayMessage();
    let i = 0;
    setTyped('');
    const interval = setInterval(() => {
      setTyped(greeting.slice(0, i + 1));
      i++;
      if (i >= greeting.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const getDayMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING.';
    if (hour < 17) return 'GOOD AFTERNOON.';
    return 'GOOD EVENING.';
  };

  const generatePlan = async () => {
    setLoading(true); setPlan('');
    try {
      const res = await axios.post(API + '/api/ai/daily-plan');
      setPlan(res.data.plan);
    } catch { setPlan('Could not load plan. Make sure your server is running.'); }
    setLoading(false);
  };

  const fetchQuote = async () => {
    try {
      const res = await axios.get(API + '/api/ai/quote');
      setQuote(res.data.quote);
    } catch {}
  };

  const fetchGoals = async () => {
    try {
      const res = await axios.get(API + '/api/goals');
      setGoals(res.data);
    } catch {}
  };

  const fetchHabits = async () => {
    try {
      const res = await axios.get(API + '/api/habits');
      setHabits(res.data);
    } catch {}
  };

  const fetchWeeklySummary = async () => {
    try {
      const res = await axios.get(API + '/api/ai/weekly-summary');
      setWeeklySummary(res.data.summary);
    } catch {}
  };

  const sendChat = async () => {
    if (!chatMsg.trim()) return;
    setChatLoading(true); setChatReply('');
    try {
      const res = await axios.post(API + '/api/ai/chat', { message: chatMsg });
      setChatReply(res.data.reply);
    } catch { setChatReply('Error connecting to AI.'); }
    setChatLoading(false);
  };

  const completeHabit = async (id) => {
    try {
      await axios.post(API + '/api/habits/' + id + '/complete');
      fetchHabits();
    } catch { alert('Already completed today!'); }
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), text: newTask.trim(), done: false }]
    }));
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(prev => ({
      ...prev,
      items: prev.items.map(t => t.id === id ? { ...t, done: !t.done } : t)
    }));
  };

  const deleteTask = (id) => {
    setTasks(prev => ({ ...prev, items: prev.items.filter(t => t.id !== id) }));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDoneToday = (habit) =>
    habit.completedDates?.some(d => {
      const date = new Date(d); date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    });

  const habitsDoneToday = habits.filter(isDoneToday).length;
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;
  const tasksDone = tasks.items.filter(t => t.done).length;
  const tasksPct = tasks.items.length > 0
    ? Math.round((tasksDone / tasks.items.length) * 100) : 0;

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  }).toUpperCase();

  const pad = isMobile ? '20px' : '40px';

  const labelStyle = {
    fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase',
    color: '#888', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px',
  };
  const lineStyle = { flex: 1, height: '1px', background: '#222' };

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{ padding: '40px ' + pad + ' 32px', borderBottom: '1px solid #111' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: '#555', marginBottom: '12px' }}>
          Day {Math.floor((new Date() - new Date('2025-01-01')) / 86400000)} of your transformation
        </div>
        <div style={{
          fontSize: isMobile ? '36px' : 'clamp(48px, 6vw, 80px)',
          fontWeight: '800', lineHeight: '1', letterSpacing: '-3px', color: '#fff', marginBottom: '8px'
        }}>
          {typed}<span style={{ opacity: 0.2 }}>|</span>
        </div>
        <div style={{ fontSize: '12px', fontWeight: '300', letterSpacing: '4px', color: '#666', marginTop: '8px' }}>
          {dateStr}
        </div>
        {quote && (
          <div style={{ marginTop: '20px', paddingLeft: '12px', borderLeft: '1px solid #222', fontSize: '13px', color: '#aaa', fontStyle: 'italic', lineHeight: '1.7' }}>
            "{quote}"
          </div>
        )}

        {/* Stats — 2x2 on mobile, 4x1 on desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          marginTop: '32px',
          borderTop: '1px solid #111',
        }}>
          {[
            { num: goals.length, label: 'Goals', sub: 'active' },
            { num: habitsDoneToday + '/' + habits.length, label: 'Habits', sub: 'today' },
            { num: avgProgress + '%', label: 'Progress', sub: 'avg' },
            { num: tasksDone + '/' + tasks.items.length, label: 'Tasks', sub: 'done' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '20px 16px',
              borderRight: (!isMobile && i < 3) ? '1px solid #111' : 'none',
              borderBottom: (isMobile && i < 2) ? '1px solid #111' : 'none',
            }}>
              <div style={{ fontSize: isMobile ? '32px' : '40px', fontWeight: '800', letterSpacing: '-2px', lineHeight: '1', color: '#fff' }}>{s.num}</div>
              <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#666', marginTop: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTENT — single column on mobile, two column on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
      }}>

        {/* LEFT / MAIN */}
        <div style={{ padding: '32px ' + pad, borderRight: isMobile ? 'none' : '1px solid #111' }}>

          {/* AI Plan */}
          <div style={labelStyle}>
            AI Daily Plan
            <div style={lineStyle} />
            <button onClick={generatePlan} style={{
              background: 'none', border: '1px solid #333', color: '#888',
              fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
              padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>Regenerate</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#555' }}>
                Preparing your day...
              </div>
            </div>
          ) : <PlanBlock text={plan} />}

          {/* TASK TRACKER */}
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #111' }}>
            <div style={labelStyle}>
              Today's Tasks
              <div style={lineStyle} />
              <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#555', whiteSpace: 'nowrap' }}>
                {tasksDone}/{tasks.items.length}
              </span>
            </div>

            {tasks.items.length > 0 && (
              <div style={{ height: '1px', background: '#222', marginBottom: '20px' }}>
                <div style={{ height: '1px', background: '#fff', width: tasksPct + '%', transition: 'width 0.5s ease' }} />
              </div>
            )}

            <div style={{ display: 'flex', border: '1px solid #222', marginBottom: '20px' }}>
              <input type="text" placeholder="Add a task for today..."
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                style={{
                  flex: 1, background: 'none', border: 'none', color: '#fff',
                  fontSize: '13px', padding: '12px 16px', outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button onClick={addTask} style={{
                background: 'none', border: 'none', borderLeft: '1px solid #222',
                color: '#888', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>Add</button>
            </div>

            {tasks.items.length === 0 ? (
              <div style={{ fontSize: '11px', color: '#333', letterSpacing: '2px', textAlign: 'center', padding: '20px 0' }}>
                NO TASKS YET
              </div>
            ) : (
              <div>
                {tasks.items.map(task => (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 0', borderBottom: '1px solid #0f0f0f',
                  }}>
                    <div onClick={() => toggleTask(task.id)} style={{
                      width: '20px', height: '20px', flexShrink: 0,
                      border: task.done ? '1px solid #fff' : '1px solid #333',
                      background: task.done ? '#fff' : 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {task.done && <div style={{ color: '#000', fontSize: '13px', fontWeight: '700' }}>✓</div>}
                    </div>
                    <div onClick={() => toggleTask(task.id)} style={{
                      flex: 1, fontSize: '14px',
                      color: task.done ? '#444' : '#fff',
                      textDecoration: task.done ? 'line-through' : 'none',
                      cursor: 'pointer',
                    }}>
                      {task.text}
                    </div>
                    <button onClick={() => deleteTask(task.id)} style={{
                      background: 'none', border: 'none', color: '#333',
                      fontSize: '20px', cursor: 'pointer', padding: '0 4px', lineHeight: 1,
                      flexShrink: 0,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ff4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#333'; }}
                    >×</button>
                  </div>
                ))}
                {tasks.items.some(t => t.done) && (
                  <button onClick={() => setTasks(prev => ({ ...prev, items: prev.items.filter(t => !t.done) }))}
                    style={{
                      background: 'none', border: 'none', color: '#444',
                      fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                      padding: '14px 0', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    Clear Completed ({tasks.items.filter(t => t.done).length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Weekly Summary */}
          {weeklySummary && (
            <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #111' }}>
              <div style={labelStyle}>Weekly Review <div style={lineStyle} /></div>
              <p style={{ fontSize: '14px', color: '#fff', lineHeight: '1.8', paddingLeft: '12px', borderLeft: '1px solid #222' }}>
                {weeklySummary}
              </p>
            </div>
          )}

          {/* Chat */}
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #111' }}>
            <div style={labelStyle}>
              Ask Your Coach
              <div style={lineStyle} />
              <button onClick={() => setShowChat(!showChat)} style={{
                background: 'none', border: 'none', color: '#888', fontSize: '10px',
                letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {showChat ? 'Close' : 'Open'}
              </button>
            </div>
            {showChat && (
              <div>
                <div style={{ display: 'flex', border: '1px solid #222' }}>
                  <input type="text" placeholder="Ask anything..."
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    style={{
                      flex: 1, background: 'none', border: 'none', color: '#fff',
                      fontSize: '13px', padding: '14px 16px', outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                  <button onClick={sendChat} style={{
                    background: 'none', border: 'none', borderLeft: '1px solid #222',
                    color: '#888', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                    padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    {chatLoading ? '...' : 'Send'}
                  </button>
                </div>
                {chatReply && (
                  <div style={{ marginTop: '16px', paddingLeft: '12px', borderLeft: '1px solid #222', fontSize: '14px', color: '#fff', lineHeight: '1.8' }}>
                    {chatReply}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR — only on desktop, moves below on mobile */}
        <div style={{ borderTop: isMobile ? '1px solid #111' : 'none' }}>

          <div style={{ padding: '32px 24px', borderBottom: '1px solid #111' }}>
            <div style={labelStyle}>Goals <div style={lineStyle} /></div>
            {goals.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#555' }}>No goals yet</p>
            ) : (
              goals.map(goal => (
                <div key={goal._id} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#fff' }}>{goal.title}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>{goal.progress}%</span>
                  </div>
                  <div style={{ height: '1px', background: '#222' }}>
                    <div style={{ height: '1px', background: '#fff', width: goal.progress + '%', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '32px 24px', borderBottom: '1px solid #111' }}>
            <div style={labelStyle}>Habits Today <div style={lineStyle} /></div>
            {habits.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#555' }}>No habits yet</p>
            ) : (
              habits.map(habit => {
                const done = isDoneToday(habit);
                return (
                  <div key={habit._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: '1px solid #0a0a0a',
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', color: done ? '#555' : '#fff', textDecoration: done ? 'line-through' : 'none' }}>
                        {habit.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', marginTop: '3px' }}>
                        🔥 {habit.streak} DAY STREAK
                      </div>
                    </div>
                    {done ? (
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />
                    ) : (
                      <button onClick={() => completeHabit(habit._id)} style={{
                        background: 'none', border: '1px solid #333', color: '#fff',
                        fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase',
                        padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit',
                      }}>Done</button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div style={{ padding: '32px 24px' }}>
            <div style={labelStyle}>Overall <div style={lineStyle} /></div>
            <div style={{ fontSize: '56px', fontWeight: '800', letterSpacing: '-3px', lineHeight: '1', color: '#fff' }}>
              {avgProgress}
              <span style={{ fontSize: '20px', color: '#555', fontWeight: '300' }}>%</span>
            </div>
            <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#555', marginTop: '8px' }}>
              Average across all goals
            </div>
          </div>

        </div>
      </div>

      {/* TICKER */}
      <div style={{ display: 'flex', gap: '32px', padding: '14px 20px', borderTop: '1px solid #111', overflowX: 'auto' }}>
        {[
          'Goals — ' + goals.length,
          'Habits — ' + habits.length,
          'Done — ' + habitsDoneToday,
          'Tasks — ' + tasksDone + '/' + tasks.items.length,
          'Progress — ' + avgProgress + '%',
        ].map((item, i) => (
          <div key={i} style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', whiteSpace: 'nowrap' }}>
            {item}
          </div>
        ))}
      </div>

    </div>
  );
}