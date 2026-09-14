"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

export function LeaderboardTestPicker({
  options,
  value,
}: {
  options: { id: string; title: string }[];
  value: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <select
        className="lb-select"
        value={value}
        disabled={isPending}
        onChange={(e) =>
          startTransition(() => router.push(`/leaderboard?test=${e.target.value}`))
        }
        aria-label="Choose a test"
      >
        <option value="overall">Overall</option>
        {options.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>
      {isPending ? <Spinner /> : null}
    </span>
  );
}
