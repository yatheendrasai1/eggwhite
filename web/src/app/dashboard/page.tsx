import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { getMongoClient } from "@/lib/mongoClient";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { PasscodeModel } from "@/lib/models/Passcode";
import { isTiv } from "@/lib/pro";
import { resolveDisplayNames } from "@/lib/users";
import { ACTIVE_TESTS } from "@/lib/tests/registry";
import { getDisabledTestIds } from "@/lib/tests/testSettings";
import { getGeminiModel, GEMINI_MODELS } from "@/lib/gemini";
import { BackHome } from "@/components/BackHome";
import { GeneratePasscodeButton } from "@/components/GeneratePasscodeButton";
import { PasscodesTable } from "@/components/PasscodesTable";
import { PendingSignupsTable } from "@/components/PendingSignupsTable";
import { ManageTestsTable } from "@/components/ManageTestsTable";
import { ManageLeaderboardAccountsTable } from "@/components/ManageLeaderboardAccountsTable";
import { GeminiModelPicker } from "@/components/GeminiModelPicker";

const GEMINI_MODEL_INFO: Record<string, { label: string; note: string }> = {
  "gemini-3.8-flash": {
    label: "Gemini 3.8 Flash",
    note: "Cheapest and fastest. $0.75 / $3.75 per 1M input/output tokens (introductory).",
  },
  "gemini-3.6-flash": {
    label: "Gemini 3.6 Flash",
    note: "Previous-gen Flash. $1.50 / $7.50 per 1M input/output tokens.",
  },
  "gemini-3.1-pro": {
    label: "Gemini 3.1 Pro",
    note: "Strongest reasoning, most consistent grading. $2.00 / $12.00 per 1M input/output tokens.",
  },
};

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
  const [passcodes, proProfiles, pendingSignups, disabledTestIds, accounts, geminiModel] =
    await Promise.all([
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
      getDisabledTestIds(),
      client
        .db("eggwhite")
        .collection("users")
        .find({ status: { $ne: "pending" } })
        .project({ name: 1, email: 1, username: 1 })
        .toArray(),
      getGeminiModel(),
    ]);

  const namesFor = Array.from(
    new Set([
      ...passcodes.filter((p) => p.redeemedBy).map((p) => p.redeemedBy as string),
      ...proProfiles.map((p) => p.userId),
    ])
  );
  const names = await resolveDisplayNames(namesFor);

  const accountIds = accounts.map((a) => String(a._id));
  const hiddenFlags = await UserProfileModel.find({ userId: { $in: accountIds } })
    .select("userId hideFromLeaderboard")
    .lean();
  const hiddenSet = new Set(
    hiddenFlags.filter((p) => p.hideFromLeaderboard).map((p) => p.userId)
  );

  return (
    <main className="page">
      <div className="wrap">
        <BackHome />
        <header className="masthead">
          <h1>Dashboard</h1>
        </header>

        <section className="dash-section">
          <h2>Manage tests</h2>
          <p className="filler" style={{ marginBottom: 12 }}>
            Disabling a test hides it from the home page for everybody and blocks new
            attempts. Attempts already in progress can still be finished. Archived tests
            aren&rsquo;t controlled here — they stay visible always.
          </p>
          <ManageTestsTable
            tests={ACTIVE_TESTS.map((t) => ({
              id: t.id,
              title: t.title,
              tag: t.tag,
              enabled: !disabledTestIds.has(t.id),
            }))}
          />
        </section>

        <section className="dash-section">
          <h2>Grading model</h2>
          <p className="filler" style={{ marginBottom: 12 }}>
            Which Gemini model grades the LLM-graded tests (translation, jira comment) and
            their revalidations. Takes effect on the next grading call — nothing needs a
            restart.
          </p>
          <GeminiModelPicker
            options={GEMINI_MODELS.map((id) => ({
              id,
              label: GEMINI_MODEL_INFO[id]?.label ?? id,
              note: GEMINI_MODEL_INFO[id]?.note ?? "",
            }))}
            current={geminiModel}
          />
        </section>

        <section className="dash-section">
          <h2>Leaderboard accounts</h2>
          <p className="filler" style={{ marginBottom: 12 }}>
            Hide test or admin accounts so their results don&rsquo;t count toward the
            leaderboard for anybody.
          </p>
          <ManageLeaderboardAccountsTable
            accounts={accounts
              .map((a) => ({
                userId: String(a._id),
                name: (a.name as string) || (a.username as string) || "",
                email: (a.email as string) || "",
                hidden: hiddenSet.has(String(a._id)),
              }))
              .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email))}
          />
        </section>

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
