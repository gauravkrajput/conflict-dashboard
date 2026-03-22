import { useState, useEffect } from 'react';

export default function Header({ lastRefresh }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => setTime(new Date().toUTCString().replace('GMT', 'UTC'));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <div className="logo-mark">⬡</div>
          <div>
            <h1 className="site-title">WARWATCH</h1>
            <p className="site-subtitle">US · ISRAEL · IRAN — LIVE INTELLIGENCE DASHBOARD</p>
          </div>
        </div>
        <div className="header-right">
          <div className="status-pill">
            <span className="pulse-dot"></span>
            LIVE
          </div>
          <div className="time-block">
            <div className="time-label">UTC TIME</div>
            <div className="time-value">{time}</div>
          </div>
        </div>
      </div>
      <div className="ticker-bar">
        <span className="ticker-label">LATEST ▶</span>
        <span className="ticker-content">
          Brent Crude +8.8% · Strait of Hormuz on alert · UN emergency session convened · US carrier group repositioned · Iron Dome intercepts wave of projectiles · Gold hits $2,387 · Global shipping insurance +340%
        </span>
      </div>
    </header>
  );
}
