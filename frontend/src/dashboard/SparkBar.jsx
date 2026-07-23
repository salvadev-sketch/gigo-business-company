import { C } from "./dashboardUtils";

export default function SparkBar({ data }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => d.value || d.total || 0));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "60px", padding: "0 4px" }}>
      {data.map((d, i) => {
        const val = d.value || d.total || 0;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "100%", height: `${max ? ((val / max) * 48) : 4}px`, background: i === data.length - 1 ? C.accent : "rgba(245,166,35,0.3)", borderRadius: "3px 3px 0 0" }} />
            <span style={{ fontSize: "9px", color: C.textMuted }}>{d.month || d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
