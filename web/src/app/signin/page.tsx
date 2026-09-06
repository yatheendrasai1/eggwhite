import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInButtons } from "@/components/AuthButtons";

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
        <header className="masthead">
          <p className="eyebrow">eggwhite</p>
          <h1>
            Sign <em>in</em>
          </h1>
          <p className="lede">
            Choose a provider. We only read your name and email to label your results.
          </p>
        </header>
        <div className="auth-card">
          <SignInButtons callbackUrl={callbackUrl || "/"} />
        </div>
      </div>
    </main>
  );
}
