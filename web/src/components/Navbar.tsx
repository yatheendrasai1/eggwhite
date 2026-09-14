import Link from "next/link";
import { auth } from "@/auth";
import { SignInLink } from "@/components/AuthButtons";
import { AboutUs } from "@/components/AboutUs";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { SideMenu } from "@/components/SideMenu";
import { connectDB } from "@/lib/db";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { isProActive, isTiv } from "@/lib/pro";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  let nickname: string | null = null;
  let isPro = false;
  let showDashboard = false;
  if (user?.id) {
    await connectDB();
    const profile = await UserProfileModel.findOne({ userId: user.id })
      .select("nickname proExpiresAt isTiv")
      .lean();
    nickname = profile?.nickname || null;
    isPro = isProActive(profile);
    showDashboard = isTiv(profile);
  }

  return (
    <nav className="navbar">
      <SideMenu />
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nav-logo" src="/egvit-icon.png" alt="Egvit" />
        <span className="nav-name">Egvit</span>
        {isPro && <span className="pro-badge">PRO</span>}
      </Link>
      <div className="nav-spacer">
        {user ? (
          <>
            <Link href="/leaderboard" className="nav-btn" style={{ textDecoration: "none" }}>
              Leaderboard
            </Link>
            {showDashboard && (
              <Link href="/dashboard" className="nav-btn" style={{ textDecoration: "none" }}>
                Dashboard
              </Link>
            )}
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
