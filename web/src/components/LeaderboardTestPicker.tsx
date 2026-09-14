"use client";

import { useRouter } from "next/navigation";

export function LeaderboardTestPicker({
  options,
  value,
}: {
  options: { id: string; title: string }[];
  value: string;
}) {
  const router = useRouter();

  return (
    <select
      className="lb-select"
      value={value}
      onChange={(e) => router.push(`/leaderboard?test=${e.target.value}`)}
      aria-label="Choose a test"
    >
      <option value="overall">Overall</option>
      {options.map((t) => (
        <option key={t.id} value={t.id}>
          {t.title}
        </option>
      ))}
    </select>
  );
}
