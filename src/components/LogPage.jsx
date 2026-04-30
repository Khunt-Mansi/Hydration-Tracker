import { Heart } from "lucide-react";
import { moodOptions } from "../constants/hydration";

export default function LogPage({ todayLog, onUpdateField, onExport }) {
  return (
    <section className="page active">
      <div className="card hero">
        <div className="card-inner">
          <p className="tiny-label">Daily log</p>
          <h1>How was today?</h1>
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <div className="icon-title pink"><Heart size={18} /><h3>Mood + note</h3></div>
          <div className="mood-grid">
            {moodOptions.map((mood) => (
              <button
                key={mood}
                className={`mood-btn ${todayLog?.mood === mood ? "active" : ""}`}
                type="button"
                onClick={() => onUpdateField({ mood })}
              >
                {mood}
              </button>
            ))}
          </div>

          <textarea
            value={todayLog?.note || ""}
            onChange={(event) => onUpdateField({ note: event.target.value })}
            placeholder="Write today’s note..."
          />
        </div>
      </div>

      <div className="button-grid">
        <button className="secondary-btn" type="button" onClick={onExport}>⬇ Export CSV</button>
        <button className="primary-btn saved-status" type="button" disabled>✓ Auto saved</button>
      </div>
    </section>
  );
}
