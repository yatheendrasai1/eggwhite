"use client";

import { useState } from "react";
import Link from "next/link";

export function SignupForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="auth-card">
        <p>
          Account created for <b>{username}</b>. Ask the admin for your entry code, then{" "}
          <Link href="/account/activate" style={{ color: "var(--violet)" }}>
            activate your account
          </Link>
          .
        </p>
      </div>
    );
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
        placeholder="Password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
      />
      <input
        className="dash-input"
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
        required
      />
      {error && <p style={{ color: "var(--bad)", fontSize: 13.5, margin: 0 }}>{error}</p>}
      <button type="submit" className="btn" disabled={busy}>
        {busy ? "Creating…" : "Create account"}
      </button>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0, textAlign: "center" }}>
        Already have an entry code?{" "}
        <Link href="/account/activate" style={{ color: "var(--violet)" }}>
          Activate
        </Link>
        {" · "}
        <Link href="/account/login" style={{ color: "var(--violet)" }}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
