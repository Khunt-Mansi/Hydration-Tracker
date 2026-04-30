import { CalendarDays, Trophy } from "lucide-react";
import { BONUS_TARGET_TUMBLERS, TUMBLER_LITERS } from "../constants/hydration";
import { formatDisplayDate, getLastNDates } from "../utils/date";

function logMapByDate(logs) {
  return new Map(logs.map((log) => [log.log_date, log]));
}

export default function InsightsPage({ logs, todayTumblers, streak }) {
  const map = logMapByDate(logs);
  const weekly = getLastNDates(7).map((date) => map.get(date) || { log_date: date, tumblers: 0 });
  const weeklyAverage = weekly.reduce((sum, log) => sum + Number(log.tumblers || 0), 0) / weekly.length;
  const best = weekly.reduce((bestLog, log) => Number(log.tumblers || 0) > Number(bestLog.tumblers || 0) ? log : bestLog, weekly[0]);

  const badges = [
    { name: "First Sip 💧", active: todayTumblers > 0 },
    { name: "1 Tumbler Done 👍", active: todayTumblers >= 1 },
    { name: "Daily Goal 🎯", active: todayTumblers >= 1.5 },
    { name: "Hydration Queen 👑", active: todayTumblers >= 2 },
    { name: "3 Day Streak 🔥", active: streak >= 3 },
    { name: "7 Day Glow ✨", active: streak >= 7 },
  ];

  return (
    <section className="page active">
      <div className="card hero">
        <div className="card-inner">
          <p className="tiny-label">Insights</p>
          <h1>Weekly Glow</h1>
          <p className="desc">Simple weekly view from saved database records.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <div className="icon-title sky"><CalendarDays size={18} /><h3>Weekly insight</h3></div>
          <div className="bar-chart">
            {weekly.map((log) => {
              const value = Number(log.tumblers || 0);
              const height = Math.max(3, Math.min((value / BONUS_TARGET_TUMBLERS) * 88, 88));
              const day = new Date(`${log.log_date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3);

              return (
                <div className="bar-item" key={log.log_date} title={`${formatDisplayDate(log.log_date)}: ${value} tumbler(s)`}>
                  <div className="bar-wrap">
                    <div className="bar" style={{ height: `${height}px` }} />
                  </div>
                  <span className="bar-label">{day}</span>
                </div>
              );
            })}
          </div>

          <div className="insight-grid">
            <div className="insight-box">
              <b>Weekly avg</b>
              <span>{weeklyAverage.toFixed(2)} tumblers/day</span>
            </div>
            <div className="insight-box">
              <b>Best day</b>
              <span>{formatDisplayDate(best.log_date)} · {Number(best.tumblers || 0)} tumbler</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <div className="icon-title yellow"><Trophy size={18} /><h3>Badges</h3></div>
          <div className="list">
            {badges.map((badge) => (
              <div className="history-item" key={badge.name} style={{ opacity: badge.active ? 1 : 0.55 }}>
                <b>{badge.name}</b>
                <span>{badge.active ? "Unlocked" : "Locked"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
