import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { isProActive } from "@/lib/pro";
import { getActiveAttempts, listAttempts } from "@/lib/attempts";
import { getDisabledTestIds } from "@/lib/tests/testSettings";
import { LandingHub } from "@/components/LandingHub";
import { SignInButtons } from "@/components/AuthButtons";
import { WordOfTheDay } from "@/components/WordOfTheDay";
import { wordOfTheDay } from "@/lib/wordOfTheDay";

function greeting(): { line: string; icon: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { line: "Good morning", icon: "☀️" };
  if (hour < 18) return { line: "Good afternoon", icon: "🌤️" };
  return { line: "Good evening", icon: "🌙" };
}

export default async function LandingPage() {
  const session = await auth();

  if (session?.user?.id) {
    await connectDB();
    const [profile, active, attempts, disabledTestIds] = await Promise.all([
      UserProfileModel.findOne({ userId: session.user.id }).select("proExpiresAt").lean(),
      getActiveAttempts(session.user.id),
      listAttempts(session.user.id),
      getDisabledTestIds(),
    ]);
    const isPro = isProActive(profile);
    const firstName = (session.user.name || "").trim().split(/\s+/)[0] || "there";
    const { line, icon } = greeting();

    return (
      <main className="page">
        <div className="wrap">
          <header className="greeting">
            <p className="greeting-line">{line},</p>
            <p className="greeting-name">
              {firstName} <span aria-hidden="true">{icon}</span>
            </p>
          </header>

          <WordOfTheDay entry={wordOfTheDay()} />

          <LandingHub
            active={active}
            attempts={attempts}
            userName={session.user.name || ""}
            isPro={isPro}
            disabledTestIds={Array.from(disabledTestIds)}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="wrap">
        <div className="hero-card">
          <header className="login-masthead">
            <div className="login-logo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="login-logo" src="/egvit-icon.png" alt="" />
              <span className="login-bubble">Hey there! 👋</span>
            </div>
            <p className="login-name">egvit</p>
            <p className="login-caption">
              Better English. Brighter opportunities. Build your grammar and vocabulary with
              short, focused tests — and watch your progress grow.
            </p>
          </header>

          <div style={{ marginTop: 28 }}>
            <SignInButtons />
          </div>
        </div>

        <p className="foot" style={{ margin: "0 0 16px" }}>
          We store your name, email and test results. Nothing else — promise. 🤞
        </p>
      </div>
    </main>
  );
}
