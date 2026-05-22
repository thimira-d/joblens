interface SkillPillProps {
  skill: string;
  variant: "match" | "gap";
}

export default function SkillPill({ skill, variant }: SkillPillProps) {
  const styles =
    variant === "match"
      ? "bg-[#D1FAE5] text-[#065F46] dark:bg-emerald-900/40 dark:text-emerald-300"
      : "bg-[#FEF3C7] text-[#92400E] dark:bg-amber-900/40 dark:text-amber-300";

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles}`}>
      {skill}
    </span>
  );
}
