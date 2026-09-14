import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BackHome } from "@/components/BackHome";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
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
          <p className="login-name">egvit</p>
          <p className="login-caption">Sign in with your username and password.</p>
        </header>
        <LoginForm callbackUrl={callbackUrl || "/"} />
      </div>
    </main>
  );
}
