import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BackHome } from "@/components/BackHome";
import { ActivateForm } from "@/components/ActivateForm";

export default async function ActivatePage() {
  const session = await auth();
  if (session?.user?.id) redirect("/");

  return (
    <main className="page">
      <div className="wrap">
        <BackHome />
        <header className="login-masthead">
          <p className="login-name">egvit</p>
          <p className="login-caption">Enter your username and the entry code the admin gave you.</p>
        </header>
        <ActivateForm />
      </div>
    </main>
  );
}
