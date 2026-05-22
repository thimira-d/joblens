interface MatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function MatchScore({ score, size = "md" }: MatchScoreProps) {
  const color =
    score >= 80 ? "#10B981" :
    score >= 60 ? "#0A66C2" :
    "#6B7280";

  const bgColor =
    score >= 80 ? "bg-emerald-50 border-emerald-200" :
    score >= 60 ? "bg-blue-50 border-blue-200" :
    "bg-gray-50 border-gray-200";

  const label =
    score >= 80 ? "Strong Match" :
    score >= 60 ? "Good Match" :
    "Partial Match";

  if (size === "lg") {
    return (
      <div className={`inline-flex flex-col items-center px-6 py-4 rounded-xl border-2 ${bgColor}`}>
        <span className="font-sora font-bold text-5xl" style={{ color }}>{score}</span>
        <span className="text-xs font-medium mt-1" style={{ color }}>/100</span>
        <span className="text-xs font-semibold mt-2 uppercase tracking-wide" style={{ color }}>{label}</span>
      </div>
    );
  }

  if (size === "sm") {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${bgColor}`} style={{ color }}>
        {score}% match
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${bgColor}`}>
      <span className="font-sora font-bold text-lg leading-none" style={{ color }}>{score}</span>
      <div>
        <div className="text-xs font-medium" style={{ color }}>/ 100</div>
        <div className="text-xs font-semibold" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}
