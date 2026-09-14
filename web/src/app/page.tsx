import { auth } from "@/auth";
import { getActiveAttempts, listAttempts } from "@/lib/attempts";
import { LandingHub } from "@/components/LandingHub";
import { SignInButtons } from "@/components/AuthButtons";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user?.id) {
    return (
      <main className="page">
        <div className="wrap">
          <header className="masthead masthead-quiet">
            <h1>
              Test <em>your</em> English
            </h1>
            <p className="lede">A small collection of self-scoring tests for grammar and vocabulary.</p>
          </header>

          <LandingHub
            active={await getActiveAttempts(session.user.id)}
            attempts={await listAttempts(session.user.id)}
            userName={session.user.name || ""}
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
            <img className="login-logo" src="/eggwhite-icon.png" alt="" />
            <span className="login-bubble">Hey there! 👋</span>
          </div>
          <p className="login-name">eggwhite</p>
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
