export function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDisplayDate(dateKey) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function getLastNDates(days = 7) {
  const dates = [];
  const current = new Date(`${todayKey()}T00:00:00`);

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(current);
    d.setDate(current.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }

  return dates;
}
