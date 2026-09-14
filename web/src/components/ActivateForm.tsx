"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ActivateForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [entryCode, setEntryCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, entryCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Activation failed.");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Activation failed.");
      setBusy(false);
    }
  }

  return (
    <form className="auth-card stack" onSubmit={handleSubmit}>
      <input
        className="dash-input"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        required
      />
      <input
        className="dash-input"
        placeholder="Entry code"
        value={entryCode}
        onChange={(e) => setEntryCode(e.target.value)}
        required
      />
      {error && <p style={{ color: "var(--bad)", fontSize: 13.5, margin: 0 }}>{error}</p>}
      <button type="submit" className="btn" disabled={busy}>
        {busy ? "Activating…" : "Activate account"}
      </button>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0, textAlign: "center" }}>
        Need an account?{" "}
        <Link href="/account/signup" style={{ color: "var(--violet)" }}>
          Sign up
        </Link>
      </p>
    </form>
  );
}
