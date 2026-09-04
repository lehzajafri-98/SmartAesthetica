export default function RecommendationCard({ result }) {
  const suggestions = result?.suggestions ?? [
    { treatment: "Botox (forehead)", confidence: 0.82 },
    { treatment: "Dermal Fillers (cheeks)", confidence: 0.71 }
  ];

  return (
    <aside className="glass-card p-4 max-w-md">
      <h4 className="font-semibold">AI Treatment Suggestions</h4>
      <p className="text-muted text-sm mt-1">Automated recommendations (demo)</p>

      <ul className="mt-3 space-y-3">
        {suggestions.map((s, i) => (
          <li key={i} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{s.treatment}</div>
              <div className="text-sm text-muted">Confidence: {(s.confidence*100).toFixed(0)}%</div>
            </div>
            <div className="text-sm px-2 py-1 rounded-md bg-white/10">{s.confidence > 0.75 ? 'High' : s.confidence > 0.6 ? 'Medium' : 'Low'}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
