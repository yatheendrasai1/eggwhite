"use client";

import { useState } from "react";
import type { Theme } from "@/lib/theme";
import { useLoading } from "@/components/LoadingOverlay";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function applyTheme(theme: Theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [saving, setSaving] = useState(false);
  const { withLoading } = useLoading();

  async function choose(next: Theme) {
    if (next === theme || saving) return;
    const prev = theme;
    setTheme(next);
    applyTheme(next);
    setSaving(true);
    try {
      await withLoading(async () => {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ theme: next }),
        });
        if (!res.ok) throw new Error(String(res.status));
      });
    } catch {
      setTheme(prev);
      applyTheme(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-info" style={{ marginBottom: 20 }}>
      <div className="profile-info-row">
        <span className="profile-info-label">Theme</span>
      </div>
      <div className="theme-toggle" role="group" aria-label="Theme">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`theme-toggle-opt${theme === o.value ? " active" : ""}`}
            aria-pressed={theme === o.value}
            disabled={saving}
            onClick={() => choose(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
