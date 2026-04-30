const baseItems = [
  { id: "home", icon: "💧", label: "Home" },
  { id: "log", icon: "📝", label: "Log" },
  { id: "insights", icon: "📊", label: "Insights" },
  { id: "history", icon: "📘", label: "History" },
];

export default function BottomNav({ activePage, onChange, isAdmin }) {
  const items = isAdmin
    ? [...baseItems, { id: "admin", icon: "🛡️", label: "Admin" }]
    : baseItems;

  return (
    <nav className={`bottom-nav ${isAdmin ? "admin-nav" : ""}`} aria-label="Main navigation">
      {items.map((item) => (
        <button
          key={item.id}
          className={`nav-link ${activePage === item.id ? "active" : ""}`}
          onClick={() => onChange(item.id)}
          type="button"
        >
          <span className="ico">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
