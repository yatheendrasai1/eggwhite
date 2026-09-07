import { auth } from "@/auth";
import { getActiveAttempts, listAttempts } from "@/lib/attempts";
import { LandingHub } from "@/components/LandingHub";
import { SignInButtons } from "@/components/AuthButtons";

export default async function LandingPage() {
  const session = await auth();

  return (
    <main className="page">
      <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">eggwhite · English practice</p>
          <h1>
            Test <em>your</em> English
          </h1>
          <p className="lede">
            A small collection of self-scoring tests for grammar and vocabulary. Sign in
            and your progress is saved to your account — close the tab and pick up any
            device.
          </p>
        </header>

        {session?.user?.id ? (
          <LandingHub
            active={await getActiveAttempts(session.user.id)}
            attempts={await listAttempts(session.user.id)}
            userName={session.user.name || ""}
          />
        ) : (
          <div className="auth-card">
            <p className="section-label" style={{ marginBottom: 12 }}>
              Sign in to start
            </p>
            <SignInButtons />
            <p className="foot" style={{ margin: "16px 0 0" }}>
              We store your name, email and test results. Nothing else.
            </p>
          </div>
        )}

        <p className="foot">Results are saved to your eggwhite account.</p>
      </div>
    </main>
  );
}
