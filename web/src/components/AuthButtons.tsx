"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButtons({ callbackUrl = "/" }: { callbackUrl?: string }) {
  return (
    <div className="stack">
      <button
        type="button"
        className="oauth-btn"
        onClick={() => signIn("google", { callbackUrl })}
      >
        Continue with Google
      </button>
      <button
        type="button"
        className="oauth-btn"
        onClick={() => signIn("github", { callbackUrl })}
      >
        Continue with GitHub
      </button>
    </div>
  );
}

export function SignInLink() {
  return (
    <button
      type="button"
      className="nav-btn solid"
      onClick={() => signIn(undefined, { callbackUrl: "/" })}
    >
      Sign in
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      type="button"
      className="nav-btn"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
}
