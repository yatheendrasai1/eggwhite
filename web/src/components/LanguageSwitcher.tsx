"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Language } from "@/lib/language";
import { useLoading } from "@/components/LoadingOverlay";
import { useToast } from "@/components/Toast";

const OPTIONS: { value: Language; label: string; title: string }[] = [
  { value: "english", label: "EN", title: "English" },
  { value: "malayalam", label: "ML", title: "Malayalam" },
];

/** Navbar toggle between the English tests and the Malayalam module (tiv-only). */
export function LanguageSwitcher({ initialLanguage }: { initialLanguage: Language }) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [saving, setSaving] = useState(false);
  const { withLoading } = useLoading();
  const { showToast } = useToast();

  async function choose(next: Language) {
    if (next === language || saving) return;
    const prev = language;
    setLanguage(next);
    setSaving(true);
    try {
      await withLoading(async () => {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ language: next }),
        });
        if (!res.ok) throw new Error(String(res.status));
      });
      router.push("/");
      router.refresh();
    } catch {
      setLanguage(prev);
      showToast("Couldn't switch language. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="theme-toggle lang-switch" role="group" aria-label="Learning language">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title}
          aria-label={o.title}
          className={`theme-toggle-opt${language === o.value ? " active" : ""}`}
          aria-pressed={language === o.value}
          disabled={saving}
          onClick={() => choose(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
