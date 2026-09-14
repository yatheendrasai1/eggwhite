import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { getMongoClient } from "@/lib/mongoClient";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { PasscodeModel } from "@/lib/models/Passcode";
import { isTiv } from "@/lib/pro";
import { resolveDisplayNames } from "@/lib/users";
import { BackHome } from "@/components/BackHome";
import { GeneratePasscodeButton } from "@/components/GeneratePasscodeButton";
import { PasscodesTable } from "@/components/PasscodesTable";
import { PendingSignupsTable } from "@/components/PendingSignupsTable";

export const dynamic = "force-dynamic";

function fmt(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  await connectDB();
  const profile = await UserProfileModel.findOne({ userId: session.user.id }).lean();
  if (!isTiv(profile)) notFound();

  const client = await getMongoClient();
  const [passcodes, proProfiles, pendingSignups] = await Promise.all([
    PasscodeModel.find().sort({ createdAt: -1 }).lean(),
    UserProfileModel.find({ proExpiresAt: { $ne: null } })
      .sort({ proExpiresAt: 1 })
      .lean(),
    client
      .db("eggwhite")
      .collection("users")
      .find({ status: "pending" })
      .sort({ createdAt: -1 })
      .project({ username: 1, entryCode: 1, createdAt: 1 })
      .toArray(),
  ]);

  const namesFor = Array.from(
    new Set([
      ...passcodes.filter((p) => p.redeemedBy).map((p) => p.redeemedBy as string),
      ...proProfiles.map((p) => p.userId),
    ])
  );
  const names = await resolveDisplayNames(namesFor);

  return (
    <main className="page">
      <div className="wrap">
        <BackHome />
        <header className="masthead">
          <h1>Dashboard</h1>
        </header>

        <section className="dash-section">
          <h2>Passcodes</h2>
          <GeneratePasscodeButton />
          <PasscodesTable
            passcodes={passcodes.map((p) => ({
              id: String(p._id),
              code: p.code,
              label: p.label || null,
              used: p.used ?? false,
              redeemedBy: p.redeemedBy ?? null,
              redeemedAt: p.redeemedAt ? p.redeemedAt.toISOString() : null,
              createdAt: p.createdAt ? p.createdAt.toISOString() : null,
            }))}
            names={names}
          />
        </section>

        <section className="dash-section">
          <h2>Pending signups</h2>
          <PendingSignupsTable
            pending={pendingSignups.map((p) => ({
              id: String(p._id),
              username: p.username as string,
              entryCode: p.entryCode as string,
              createdAt: p.createdAt ? (p.createdAt as Date).toISOString() : null,
            }))}
          />
        </section>

        <section className="dash-section">
          <h2>Pro accounts</h2>
          {proProfiles.length === 0 ? (
            <p className="filler">No pro accounts yet.</p>
          ) : (
            <ul className="dash-list">
              {proProfiles.map((p) => (
                <li className="dash-row" key={p.userId}>
                  <div className="dash-row-top">
                    <span className="dash-row-label">{names[p.userId] ?? p.userId}</span>
                  </div>
                  <div className="dash-row-meta">
                    <span>
                      Pro expires: <b>{fmt(p.proExpiresAt)}</b>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
