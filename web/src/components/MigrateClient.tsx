"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GUEST_FILES, guestRecordKey, type GuestRecord } from "@/lib/guestMigration";
import { LoaderBlock } from "@/components/Spinner";

type Phase = "checking" | "migrating" | "empty" | "done" | "error";

type MigrateResult = {
  migrated: string[];
  skipped: { file: string; testId?: string; reason: string }[];
};

function readGuestRecords(): { file: string; record: GuestRecord }[] {
  const found: { file: string; record: GuestRecord }[] = [];
  for (const file of GUEST_FILES) {
    try {
      const raw = localStorage.getItem(guestRecordKey(file));
      if (!raw) continue;
      const record = JSON.parse(raw) as GuestRecord;
      found.push({ file, record });
    } catch {
      // corrupt entry — skip it
    }
  }
  return found;
}

export function MigrateClient({ userName }: { userName: string }) {
  const router = useRouter();
  const [records] = useState(() => readGuestRecords());
  const [phase, setPhase] = useState<Phase>(records.length === 0 ? "empty" : "migrating");
  const [result, setResult] = useState<MigrateResult | null>(null);

  useEffect(() => {
    if (records.length === 0) return;
    let cancelled = false;
    fetch("/api/migrate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ records }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`migrate → ${res.status}`);
        const data = (await res.json()) as MigrateResult;
        if (cancelled) return;
        const skippedFiles = new Set(data.skipped.map((s) => s.file));
        // Clear the local copy for every record the server actually imported,
        // so guest mode starts fresh on this device for those tests.
        for (const { file } of records) {
          if (skippedFiles.has(file)) continue;
          localStorage.removeItem(guestRecordKey(file));
        }
        setResult(data);
        setPhase("done");
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [records]);

  if (phase === "checking" || phase === "migrating") {
    return (
      <div className="auth-card">
        <LoaderBlock
          label={
            phase === "migrating"
              ? "Bringing your progress over…"
              : "Checking this device for guest progress…"
          }
        />
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="auth-card">
        <p className="section-label" style={{ marginBottom: 12 }}>
          Nothing to bring over
        </p>
        <p className="foot" style={{ margin: "0 0 16px" }}>
          No guest progress was found on this device{userName ? `, ${userName}` : ""} —
          you&rsquo;re all set.
        </p>
        <button className="btn" onClick={() => router.push("/")}>
          Continue to eggwhite
        </button>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="auth-card">
        <p className="section-label" style={{ marginBottom: 12 }}>
          Something went wrong
        </p>
        <p className="foot" style={{ margin: "0 0 16px" }}>
          We couldn&rsquo;t reach the server to migrate your guest progress. Your local data is
          untouched — try again from a test page&rsquo;s &ldquo;Login / Sign up&rdquo; link.
        </p>
        <button className="btn" onClick={() => router.push("/")}>
          Continue to eggwhite
        </button>
      </div>
    );
  }

  const migratedCount = result?.migrated.length ?? 0;
  const skippedCount = result?.skipped.length ?? 0;

  return (
    <div className="auth-card">
      <p className="section-label" style={{ marginBottom: 12 }}>
        {migratedCount > 0 ? "Progress moved in!" : "Nothing new to bring over"}
      </p>
      {migratedCount > 0 ? (
        <p className="foot" style={{ margin: "0 0 8px" }}>
          Brought {migratedCount} test{migratedCount > 1 ? "s" : ""} from this device into your
          account.
        </p>
      ) : null}
      {skippedCount > 0 ? (
        <p className="foot" style={{ margin: "0 0 16px" }}>
          {skippedCount} test{skippedCount > 1 ? "s" : ""} already had progress on your account
          and {skippedCount > 1 ? "were" : "was"} left as-is.
        </p>
      ) : (
        <div style={{ marginBottom: 16 }} />
      )}
      <button className="btn" onClick={() => router.push("/")}>
        Continue to eggwhite
      </button>
    </div>
  );
}
