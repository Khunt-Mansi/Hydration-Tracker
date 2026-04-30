import { useEffect, useMemo, useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import AuthPage from "./components/AuthPage";
import BottomNav from "./components/BottomNav";
import HistoryPage from "./components/HistoryPage";
import HomePage from "./components/HomePage";
import InsightsPage from "./components/InsightsPage";
import LogPage from "./components/LogPage";
import ThemeToggle from "./components/ThemeToggle";
import { LogOut } from "lucide-react";
import {
  BONUS_TARGET_TUMBLERS,
  RECOMMENDED_GOAL_LITERS,
  SUCCESS_TARGET_TUMBLERS,
} from "./constants/hydration";
import { getAllHydrationLogs } from "./services/adminService";
import { getSession, signOut } from "./services/authService";
import { sendHydrationReport } from "./services/emailService";
import {
  deleteLog,
  emptyLog,
  getLogs,
  upsertTodayLog,
} from "./services/hydrationService";
import { todayKey } from "./utils/date";

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "").toLowerCase();

function calculateStreak(logs) {
  const map = new Map(
    logs.map((log) => [log.log_date, Number(log.tumblers || 0)]),
  );
  const current = new Date(`${todayKey()}T00:00:00`);
  let count = 0;

  for (let i = 0; i < 3650; i += 1) {
    const d = new Date(current);
    d.setDate(current.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if ((map.get(key) || 0) >= SUCCESS_TARGET_TUMBLERS) count += 1;
    else break;
  }

  return count;
}

function exportCsv(logs) {
  const rows = [
    [
      "Date",
      "Tumblers",
      "Liters",
      "Goal Liters",
      "Streak",
      "Goal Completed",
      "Mood",
      "Note",
    ],
    ...logs
      .slice()
      .reverse()
      .map((log) => [
        log.log_date,
        Number(log.tumblers || 0).toFixed(2),
        Number(log.liters || Number(log.tumblers || 0) * 1.2).toFixed(2),
        Number(log.daily_goal_liters || 2.4).toFixed(2),
        Number(log.streak_count || 0),
        Number(log.tumblers || 0) >= SUCCESS_TARGET_TUMBLERS ? "Yes" : "No",
        log.mood || "",
        (log.note || "").replaceAll("\n", " "),
      ]),
  ];

  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `drashti-hydration-${todayKey()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function App() {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState("home");
  const [logs, setLogs] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pouring, setPouring] = useState(false);
  const [emailState, setEmailState] = useState("idle");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("hydration-theme") || "dark",
  );

  const isAdmin = Boolean(
    session?.user?.email && session.user.email.toLowerCase() === ADMIN_EMAIL,
  );
  const todayLog = useMemo(
    () => logs.find((log) => log.log_date === todayKey()) || emptyLog(),
    [logs],
  );
  const streak = useMemo(() => calculateStreak(logs), [logs]);
  const username = useMemo(
    () => session?.user?.email?.split("@")[0] || "Drashti",
    [session],
  );

  async function loadSessionAndLogs(showLoader = true) {
    try {
      if (showLoader) setLoading(true);
      const activeSession = await getSession();
      setSession(activeSession);

      if (activeSession) {
        const data = await getLogs();
        setLogs(data);

        if (activeSession.user?.email?.toLowerCase() === ADMIN_EMAIL) {
          const allData = await getAllHydrationLogs();
          setAdminLogs(allData);
        }
      }
    } catch (error) {
      console.error("Load failed", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessionAndLogs(false);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    localStorage.setItem("hydration-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function getStreakAfterChange(nextTumblers) {
    const mergedLogs = [
      { ...todayLog, log_date: todayKey(), tumblers: nextTumblers },
      ...logs.filter((log) => log.log_date !== todayKey()),
    ];
    return calculateStreak(mergedLogs);
  }

  async function refreshLogs() {
    const data = await getLogs();
    setLogs(data);
    if (isAdmin) setAdminLogs(await getAllHydrationLogs());
  }

  async function sendReport(
    log = todayLog,
    nextStreak = streak,
    source = "manual",
  ) {
    const storageKey = `hydration-email-${todayKey()}`;
    if (source === "auto" && localStorage.getItem(storageKey) === "sent")
      return;

    setEmailState("sending");
    const result = await sendHydrationReport({
      todayLog: log,
      streak: nextStreak,
      username,
    });
    setEmailState(result.ok ? "sent" : "failed");

    if (source === "auto" && result.ok)
      localStorage.setItem(storageKey, "sent");
    window.setTimeout(() => setEmailState("idle"), 3500);
  }

  async function refreshSession() {
    const freshSession = await getSession();
    if (!freshSession) {
      setSession(null);
      setLogs([]);
      setAdminLogs([]);
    } else {
      setSession(freshSession);
    }
    return freshSession;
  }

  async function updateToday(partial) {
    // Ensure session is still valid before saving
    let activeSession = session;
    if (!activeSession?.user?.id) {
      activeSession = await refreshSession();
      if (!activeSession?.user?.id) return null;
    }

    const next = {
      tumblers: Number(todayLog.tumblers || 0),
      mood: todayLog.mood || "",
      note: todayLog.note || "",
      ...partial,
    };

    next.tumblers = Math.max(
      0,
      Math.min(BONUS_TARGET_TUMBLERS, Number(next.tumblers || 0)),
    );
    const nextStreak = getStreakAfterChange(next.tumblers);

    try {
      const saved = await upsertTodayLog({
        userId: activeSession.user.id,
        tumblers: next.tumblers,
        mood: next.mood,
        note: next.note,
        dailyGoalLiters: RECOMMENDED_GOAL_LITERS,
        streakCount: nextStreak,
      });

      setLogs((prev) => {
        const withoutToday = prev.filter((log) => log.log_date !== todayKey());
        return [saved, ...withoutToday].sort((a, b) =>
          b.log_date.localeCompare(a.log_date),
        );
      });

      if (isAdmin) setAdminLogs(await getAllHydrationLogs());
      return { saved, nextStreak };
    } catch (error) {
      console.error("Save failed", error);
      // Try refreshing session and retry once
      const retrySession = await refreshSession();
      if (retrySession?.user?.id) {
        try {
          const saved = await upsertTodayLog({
            userId: retrySession.user.id,
            tumblers: next.tumblers,
            mood: next.mood,
            note: next.note,
            dailyGoalLiters: RECOMMENDED_GOAL_LITERS,
            streakCount: nextStreak,
          });
          setLogs((prev) => {
            const withoutToday = prev.filter(
              (log) => log.log_date !== todayKey(),
            );
            return [saved, ...withoutToday].sort((a, b) =>
              b.log_date.localeCompare(a.log_date),
            );
          });
          return { saved, nextStreak };
        } catch (retryError) {
          console.error("Retry save failed", retryError);
        }
      }
      return null;
    }
  }

  async function handleAddWater(amount) {
    const previous = Number(todayLog.tumblers || 0);
    const next = Number((previous + amount).toFixed(2));

    if (amount > 0) {
      setPouring(true);
      window.setTimeout(() => setPouring(false), 850);
    }

    const result = await updateToday({ tumblers: next });
    if (
      result &&
      previous < SUCCESS_TARGET_TUMBLERS &&
      result.saved.tumblers >= SUCCESS_TARGET_TUMBLERS
    ) {
      sendReport(result.saved, result.nextStreak, "auto");
    }
  }

  async function handleReset() {
    await updateToday({ tumblers: 0, mood: "", note: "" });
  }

  async function handleDelete(id) {
    try {
      await deleteLog(id);
      await refreshLogs();
    } catch (error) {
      console.error("Delete failed", error);
    }
  }

  async function handleSignOut() {
    await signOut();
    setSession(null);
    setLogs([]);
    setAdminLogs([]);
    setPage("home");
  }

  if (loading) return <div className="loading-screen">Loading tracker...</div>;
  if (!session)
    return <AuthPage onAuthSuccess={() => loadSessionAndLogs(true)} />;

  return (
    <>
      <main className="app-shell">
        <header className="logged-header card compact-header">
          <div className="logged-header-content">
            <div>
              <p className="tiny-label">Drashti Tracker</p>
              <h2>Hydration</h2>
            </div>
            <div className="top-actions">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <button
                className="icon-button"
                onClick={handleSignOut}
                title="Logout"
                type="button"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {page === "home" && (
          <HomePage
            todayLog={todayLog}
            streak={streak}
            onAddWater={handleAddWater}
            onReset={handleReset}
            pouring={pouring}
            onSendReport={() => sendReport(todayLog, streak, "manual")}
            emailState={emailState}
          />
        )}

        {page === "log" && (
          <LogPage
            todayLog={todayLog}
            onUpdateField={updateToday}
            onExport={() => exportCsv(logs)}
          />
        )}
        {page === "insights" && (
          <InsightsPage
            logs={logs}
            todayTumblers={Number(todayLog.tumblers || 0)}
            streak={streak}
          />
        )}
        {page === "history" && (
          <HistoryPage logs={logs} onDelete={handleDelete} />
        )}
        {page === "admin" && isAdmin && <AdminDashboard logs={adminLogs} />}
        {page === "admin" && !isAdmin && (
          <div className="card">
            <div className="card-inner">
              <h2>Access denied</h2>
              <p className="desc">
                This dashboard is only available for admin.
              </p>
            </div>
          </div>
        )}
      </main>
      <BottomNav activePage={page} onChange={setPage} isAdmin={isAdmin} />
    </>
  );
}
