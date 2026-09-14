import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BackHome } from "@/components/BackHome";
import { SignupForm } from "@/components/SignupForm";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/");

  return (
    <main className="page">
      <div className="wrap">
        <BackHome />
        <header className="login-masthead">
          <p className="login-name">egvit</p>
          <p className="login-caption">
            Create a username and password. Your account starts locked — the admin will share
            an entry code with you to unlock it.
          </p>
        </header>
        <SignupForm />
      </div>
    </main>
  );
}
