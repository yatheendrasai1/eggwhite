import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MigrateClient } from "@/components/MigrateClient";
import { BackHome } from "@/components/BackHome";

export const dynamic = "force-dynamic";

export default async function MigratePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/migrate");

  return (
    <main className="page">
      <div className="wrap">
        <BackHome />
        <header className="login-masthead">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="login-logo" src="/eggwhite-icon.png" alt="" />
          <p className="login-name">eggwhite</p>
          <p className="login-caption">Bringing your guest-mode progress over to your account.</p>
        </header>
        <MigrateClient userName={session.user.name || ""} />
      </div>
    </main>
  );
}
