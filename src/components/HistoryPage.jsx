import { BookOpen, Trash2 } from "lucide-react";
import { TUMBLER_LITERS } from "../constants/hydration";
import { formatDisplayDate } from "../utils/date";

export default function HistoryPage({ logs, onDelete }) {
  return (
    <section className="page active">
      <div className="card hero">
        <div className="card-inner">
          <p className="tiny-label">History</p>
          <h1>Saved Records</h1>
          <p className="desc">All logs are saved in Supabase database and protected by user login.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <div className="icon-title sky"><BookOpen size={18} /><h3>Recent entries</h3></div>
          <div className="list">
            {logs.length === 0 && (
              <div className="history-item">
                <b>No history yet</b>
                <span>Start logging today 💧</span>
              </div>
            )}

            {logs.map((log) => {
              const tumblers = Number(log.tumblers || 0);
              return (
                <div className="history-item" key={log.id || log.log_date}>
                  <div>
                    <b>{formatDisplayDate(log.log_date)}</b>
                    <br />
                    <span>
                      {log.mood || "No mood"}
                      {log.note ? ` · ${log.note.slice(0, 34)}` : ""}
                    </span>
                  </div>

                  <div className="history-actions">
                    <div>
                      <b>{tumblers} 🥤</b>
                      <br />
                      <span>{(tumblers * TUMBLER_LITERS).toFixed(2)} L</span>
                    </div>
                    {log.id && (
                      <button className="small-danger" onClick={() => onDelete(log.id)} title="Delete log">
                        <Trash2 size={15} />
                      </button>
                    )}
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
