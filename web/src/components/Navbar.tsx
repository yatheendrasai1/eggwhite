import Link from "next/link";
import { auth } from "@/auth";
import { SignInLink, SignOutButton } from "@/components/AuthButtons";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="navbar">
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nav-logo" src="/eggwhite-icon.png" alt="Eggwhite" />
        <span className="nav-name">Eggwhite</span>
      </Link>
      <div className="nav-spacer">
        {user ? (
          <>
            <Link href="/me" className="nav-user" style={{ textDecoration: "none" }}>
              {user.name || user.email}
            </Link>
            <SignOutButton />
          </>
        ) : (
          <SignInLink />
        )}
      </div>
    </nav>
  );
}
