import { ShieldCheck, Users, Droplets, CalendarDays, Download } from "lucide-react";
import { TUMBLER_LITERS } from "../constants/hydration";
import { formatDisplayDate, todayKey } from "../utils/date";

function exportAdminCsv(logs) {
  const rows = [
    ["Date", "User ID", "Tumblers", "Liters", "Goal Liters", "Streak", "Mood", "Note", "Updated At"],
    ...logs.map((log) => [
      log.log_date,
      log.user_id,
      Number(log.tumblers || 0).toFixed(2),
      Number(log.liters || Number(log.tumblers || 0) * TUMBLER_LITERS).toFixed(2),
      Number(log.daily_goal_liters || 2.4).toFixed(2),
      Number(log.streak_count || 0),
      log.mood || "",
      (log.note || "").replaceAll("\n", " "),
      log.updated_at || "",
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `admin-hydration-logs-${todayKey()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminDashboard({ logs }) {
  const totalUsers = new Set(logs.map((log) => log.user_id)).size;
  const todayLogs = logs.filter((log) => log.log_date === todayKey());
  const todayAverage =
    todayLogs.length > 0
      ? todayLogs.reduce((sum, log) => sum + Number(log.tumblers || 0), 0) / todayLogs.length
      : 0;

  const topLogs = logs.slice(0, 50);

  return (
    <section className="page active">
      <div className="card hero admin-hero">
        <div className="card-inner">
          <div className="row-between">
            <div>
              <p className="tiny-label">Admin only</p>
              <h1>Admin Dashboard</h1>
            </div>
            <div className="admin-shield">
              <ShieldCheck size={32} />
            </div>
          </div>
          <p className="desc">
            Visible only for the configured admin email. Shows all database hydration records.
          </p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="card mini-card">
          <div className="card-inner">
            <div className="mini-title sky"><Users size={18} /> <span>Total Users</span></div>
            <p className="mini-number">{totalUsers}</p>
            <p className="mini-sub">unique users</p>
          </div>
        </div>

        <div className="card mini-card">
          <div className="card-inner">
            <div className="mini-title emerald"><Droplets size={18} /> <span>Today Avg</span></div>
            <p className="mini-number">{todayAverage.toFixed(2)}</p>
            <p className="mini-sub">tumblers/day</p>
          </div>
        </div>

        <div className="card mini-card">
          <div className="card-inner">
            <div className="mini-title orange"><CalendarDays size={18} /> <span>Today Logs</span></div>
            <p className="mini-number">{todayLogs.length}</p>
            <p className="mini-sub">entries today</p>
          </div>
        </div>
      </div>

      <div className="button-grid">
        <button className="secondary-btn" type="button" onClick={() => exportAdminCsv(logs)}>
          <Download size={18} /> Export Admin CSV
        </button>
        <button className="primary-btn" type="button">
          {logs.length} Total Records
        </button>
      </div>

      <div className="card">
        <div className="card-inner">
          <div className="icon-title sky"><ShieldCheck size={18} /><h3>Latest records</h3></div>
          <div className="list">
            {topLogs.length === 0 && (
              <div className="history-item">
                <b>No records found</b>
                <span>Database is empty</span>
              </div>
            )}

            {topLogs.map((log) => {
              const tumblers = Number(log.tumblers || 0);
              return (
                <div className="history-item admin-row" key={log.id}>
                  <div>
                    <b>{formatDisplayDate(log.log_date)}</b>
                    <br />
                    <span>User: {String(log.user_id).slice(0, 8)}...</span>
                    <br />
                    <span>{log.mood || "No mood"}{log.note ? ` · ${log.note.slice(0, 45)}` : ""}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <b>{tumblers} 🥤</b>
                    <br />
                    <span>{(tumblers * TUMBLER_LITERS).toFixed(2)} L · 🔥 {Number(log.streak_count || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
