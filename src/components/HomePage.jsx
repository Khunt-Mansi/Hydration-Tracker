import { Activity, Mail, RotateCcw, Sparkles, Target, Trophy } from "lucide-react";
import { BONUS_TARGET_LITERS, BONUS_TARGET_TUMBLERS, RECOMMENDED_GOAL_LITERS, SUCCESS_TARGET_TUMBLERS, TUMBLER_LITERS, getLevel } from "../constants/hydration";
import { formatDisplayDate, todayKey } from "../utils/date";

function emailLabel(state) {
  if (state === "sending") return "Sending...";
  if (state === "sent") return "Sent ✓";
  if (state === "failed") return "Email setup needed";
  return "Send mail";
}

export default function HomePage({ todayLog, streak, onAddWater, onReset, pouring, onSendReport, emailState }) {
  const tumblers = Number(todayLog?.tumblers || 0);
  const liters = Number((tumblers * TUMBLER_LITERS).toFixed(2));
  const goalLiters = Number(todayLog?.daily_goal_liters || RECOMMENDED_GOAL_LITERS);
  const goalProgress = Math.min((tumblers / SUCCESS_TARGET_TUMBLERS) * 100, 100);
  const bonusProgress = Math.min((tumblers / BONUS_TARGET_TUMBLERS) * 100, 100);
  const remainingLiters = Math.max(0, goalLiters - liters).toFixed(2);
  const level = getLevel(tumblers);

  return (
    <section className="page active home-compact">
      <div className="card hero home-hero-card">
        <div className="card-inner hero-compact-inner">
          <div>
            <p className="tiny-label">Today · {formatDisplayDate(todayKey())}</p>
            <h1>Drashti’s Hydration</h1>
            <p className="hero-copy">Daily goal: {goalLiters.toFixed(1)} L. Two full tumblers keeps the streak strong.</p>
          </div>
          <div className="goal-chip"><Target size={16} /> {Math.round(goalProgress)}%</div>
        </div>
      </div>

      <div className="card main-water-card premium-water-card">
        <div className="card-inner">
          <div className="water-main-grid">
            <div>
              <p className="date-label">Today intake</p>
              <div className="intake-line"><span className="intake-value">{tumblers}</span><span>tumblers</span></div>
              <p className="liter-label">{liters} L completed · {remainingLiters} L left</p>
            </div>

            <div className={`water-orb ${pouring ? "pouring" : ""}`} style={{ "--water-level": `${bonusProgress}%` }}>
              <div className="water-wave" />
              <div className="splash splash-one" />
              <div className="splash splash-two" />
              <span>{level.emoji}</span>
            </div>
          </div>

          <div className="progress-box compact-progress-box">
            <div className="progress-meta"><span>{level.label}</span><span>{Math.round(goalProgress)}%</span></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${goalProgress}%` }} /></div>
            <p className="progress-note">{level.note}</p>
          </div>

          <div className="action-grid compact-action-grid">
            <button className="action-btn btn-sky" onClick={() => onAddWater(0.25)} type="button">+ ¼</button>
            <button className="action-btn btn-sky-dark" onClick={() => onAddWater(0.5)} type="button">+ ½</button>
            <button className="action-btn btn-blue" onClick={() => onAddWater(1)} type="button">+ 1</button>
            <button className="action-btn btn-muted" onClick={() => onAddWater(-0.25)} type="button">− ¼</button>
          </div>
        </div>
      </div>

      <div className="home-grid-cards">
        <div className="card mini-card stat-card-flat">
          <div className="card-inner compact-card-inner">
            <div className="mini-title emerald"><Activity size={17} /><span>Stats</span></div>
            <p className="mini-number">{liters}</p>
            <p className="mini-sub">liters today</p>
          </div>
        </div>

        <div className="card mini-card stat-card-flat">
          <div className="card-inner compact-card-inner">
            <div className="mini-title orange"><Trophy size={17} /><span>Streak</span></div>
            <p className="mini-number">{streak}</p>
            <p className="mini-sub">goal days</p>
          </div>
        </div>

        <div className="card mini-card stat-card-flat wide-mini">
          <div className="card-inner compact-card-inner goal-summary">
            <div className="mini-title sky"><Sparkles size={17} /><span>Goal plan</span></div>
            <p>Recommended daily target is {RECOMMENDED_GOAL_LITERS.toFixed(1)} L. On workout days, add one small extra bottle.</p>
          </div>
        </div>

        <div className="card mini-card stat-card-flat wide-mini action-mini-card">
          <button className="mail-card-button" onClick={onSendReport} disabled={emailState === "sending"} type="button">
            <Mail size={18} /> {emailLabel(emailState)}
          </button>
          <button className="reset-mini-button" onClick={onReset} type="button"><RotateCcw size={17} /> Reset</button>
        </div>
      </div>
    </section>
  );
}
