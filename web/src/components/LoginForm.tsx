"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed.");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
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
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      {error && <p style={{ color: "var(--bad)", fontSize: 13.5, margin: 0 }}>{error}</p>}
      <button type="submit" className="btn" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0, textAlign: "center" }}>
        No account yet?{" "}
        <Link href="/account/signup" style={{ color: "var(--violet)" }}>
          Sign up
        </Link>
        {" · "}
        <Link href="/account/activate" style={{ color: "var(--violet)" }}>
          Have an entry code?
        </Link>
      </p>
    </form>
  );
}
