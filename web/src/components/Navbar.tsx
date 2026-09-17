import Link from "next/link";
import { auth } from "@/auth";
import { SignInLink } from "@/components/AuthButtons";
import { AboutUs } from "@/components/AboutUs";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { SideMenu } from "@/components/SideMenu";
import { TutorialModal } from "@/components/TutorialModal";
import { connectDB } from "@/lib/db";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { isProActive, isTiv } from "@/lib/pro";
import type { Theme } from "@/lib/theme";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  let nickname: string | null = null;
  let isPro = false;
  let proExpiresAt: string | null = null;
  let showDashboard = false;
  let theme: Theme = "system";
  if (user?.id) {
    await connectDB();
    const profile = await UserProfileModel.findOne({ userId: user.id })
      .select("nickname proExpiresAt isTiv theme")
      .lean();
    nickname = profile?.nickname || null;
    isPro = isProActive(profile);
    proExpiresAt = profile?.proExpiresAt ? profile.proExpiresAt.toISOString() : null;
    showDashboard = isTiv(profile);
    theme = (profile?.theme as Theme) || "system";
  }

  return (
    <nav className="navbar">
      <SideMenu showDashboard={showDashboard} showLeaderboard={!!user} />
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
            <Link
              href="/leaderboard"
              className="nav-btn nav-btn-wide"
              style={{ textDecoration: "none" }}
            >
              Leaderboard
            </Link>
            {showDashboard && (
              <Link
                href="/dashboard"
                className="nav-btn nav-btn-wide"
                style={{ textDecoration: "none" }}
              >
                Dashboard
              </Link>
            )}
            <TutorialModal />
            <ProfileDrawer
              userName={user.name || ""}
              userEmail={user.email || ""}
              initialNickname={nickname}
              isPro={isPro}
              proExpiresAt={proExpiresAt}
              initialTheme={theme}
            />
          </>
        ) : (
          <>
            <AboutUs />
            <TutorialModal />
            <SignInLink />
          </>
        )}
      </div>
    </nav>
  );
}
