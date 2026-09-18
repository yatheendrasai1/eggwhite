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

export default async function LandingPage() {
  const session = await auth();

  if (session?.user?.id) {
    await connectDB();
    const profile = await UserProfileModel.findOne({ userId: session.user.id })
      .select("proExpiresAt")
      .lean();
    const isPro = isProActive(profile);

    return (
      <main className="page">
        <div className="wrap">
          <WordOfTheDay entry={wordOfTheDay()} />

          <LandingHub
            active={await getActiveAttempts(session.user.id)}
            attempts={await listAttempts(session.user.id)}
            userName={session.user.name || ""}
            isPro={isPro}
            disabledTestIds={Array.from(await getDisabledTestIds())}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="wrap">
        <header className="login-masthead">
          <div className="login-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="login-logo" src="/egvit-icon.png" alt="" />
            <span className="login-bubble">Hey there! 👋</span>
          </div>
          <p className="login-name">egvit</p>
          <p className="login-caption">
            Whisk up your grammar and vocabulary with a few playful, self-scoring tests.
          </p>
        </header>

        <div className="auth-card">
          <p className="section-label" style={{ marginBottom: 12 }}>
            Let&rsquo;s get cracking!
          </p>
          <SignInButtons />
          <p className="foot" style={{ margin: "16px 0 0" }}>
            We store your name, email and test results. Nothing else — promise. 🤞
          </p>
        </div>
      </div>
    </main>
  );
}
