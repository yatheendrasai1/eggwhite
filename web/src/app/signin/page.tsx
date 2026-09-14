import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInButtons } from "@/components/AuthButtons";
import { BackHome } from "@/components/BackHome";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session?.user?.id) redirect(callbackUrl || "/");

  return (
    <main className="page">
      <div className="wrap">
        <BackHome />
        <header className="login-masthead">
          <div className="login-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="login-logo" src="/egvit-icon.png" alt="" />
            <span className="login-bubble">Welcome back! 🎉</span>
          </div>
          <p className="login-name">egvit</p>
          <p className="login-caption">
            One click and you&rsquo;re in — we only peek at your name and email, just enough
            to put your name on the scoreboard.
          </p>
        </header>
        <div className="auth-card">
          <SignInButtons callbackUrl={callbackUrl || "/"} />
        </div>
      </div>
    </main>
  );
}
