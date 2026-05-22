interface MatchScoreCardProps {
  score: number;
  recommendation: string;
}

export default function MatchScoreCard({ score, recommendation }: MatchScoreCardProps) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-[var(--success)]";
    if (s >= 60) return "text-[var(--primary-blue)]";
    return "text-[var(--text-secondary)]";
  };

  const getBadgeColor = (s: number) => {
    if (s >= 80) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
    if (s >= 60) return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`font-sora font-bold text-6xl ${getColor(score)}`}>
        {score}
      </div>
      <div className="text-sm text-[var(--text-secondary)] font-medium">out of 100</div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(score)}`}>
        {recommendation}
      </span>
    </div>
  );
}
