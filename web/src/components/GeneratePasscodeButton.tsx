"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

export function GeneratePasscodeButton() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/passcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Failed to generate passcode");
      const data = await res.json();
      setCode(data.code);
      setLabel("");
      router.refresh();
    } catch {
      setError("Failed to generate passcode.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="dash-new">
        <input
          type="text"
          className="dash-input"
          placeholder="Who is this for? (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={64}
        />
        <button className="nav-btn solid" onClick={generate} disabled={busy}>
          {busy ? (
            <>
              <Spinner /> Generating…
            </>
          ) : (
            "Generate passcode"
          )}
        </button>
      </div>
      {code && (
        <p className="dash-new-result">
          New passcode: <code>{code}</code> — also listed below.
        </p>
      )}
      {error && (
        <p className="dash-new-result" style={{ color: "var(--bad)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
