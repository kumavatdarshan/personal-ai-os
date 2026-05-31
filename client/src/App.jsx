import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Habits from './pages/Habits';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [time, setTime] = useState('');

  // Live clock — updates every second
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
      const day = days[now.getDay()];
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setTime(`${day} — ${String(h).padStart(2,'0')}:${m} ${ampm}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* NAV */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{
          fontSize: '13px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          fontWeight: '600',
        }}>
          Your Daily Partner
        </div>

        <div style={{ display: 'flex', gap: '32px' }}>
          {['dashboard', 'goals', 'habits'].map(page => (
            <button key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: currentPage === page ? '#fff' : '#444',
                fontFamily: 'inherit',
                transition: 'color 0.2s',
                padding: 0,
              }}>
              {page === 'dashboard' ? 'Today' : page}
            </button>
          ))}
        </div>

        <div style={{
          fontSize: '11px',
          letterSpacing: '2px',
          color: '#333',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {time}
        </div>
      </nav>

      {/* PAGE */}
      <main>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'goals' && <Goals />}
        {currentPage === 'habits' && <Habits />}
      </main>

    </div>
  );
}

export default App;