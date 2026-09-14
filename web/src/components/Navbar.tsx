import Link from "next/link";
import { auth } from "@/auth";
import { SignInLink } from "@/components/AuthButtons";
import { AboutUs } from "@/components/AboutUs";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { connectDB } from "@/lib/db";
import { UserProfileModel } from "@/lib/models/UserProfile";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  let nickname: string | null = null;
  if (user?.id) {
    await connectDB();
    const profile = await UserProfileModel.findOne({ userId: user.id }).lean();
    nickname = profile?.nickname || null;
  }

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
            <Link href="/leaderboard" className="nav-btn" style={{ textDecoration: "none" }}>
              Leaderboard
            </Link>
            <ProfileDrawer
              userName={user.name || ""}
              userEmail={user.email || ""}
              initialNickname={nickname}
            />
          </>
        ) : (
          <>
            <AboutUs />
            <SignInLink />
          </>
        )}
      </div>
    </nav>
  );
}
