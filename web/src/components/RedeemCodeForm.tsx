"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import { useLoading } from "@/components/LoadingOverlay";
import { useToast } from "@/components/Toast";

export function RedeemCodeForm() {
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState("");
  const { withLoading } = useLoading();
  const { showToast } = useToast();
  const router = useRouter();

  async function redeem() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setRedeeming(true);
    setError("");
    try {
      await withLoading(async () => {
        const res = await fetch("/api/pro/redeem", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error === "invalid or already-used code" ? "invalid" : "failed");
        setCode("");
        showToast("Pro unlocked — enjoy the pro tests!");
        router.refresh();
      });
    } catch (err) {
      setError(
        err instanceof Error && err.message === "invalid"
          ? "That code is invalid or already used."
          : "Couldn't redeem — try again."
      );
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <div className="profile-info" style={{ marginBottom: 20 }}>
      <div className="profile-info-row profile-info-edit">
        <span className="profile-info-label">Pro code</span>
        <div className="profile-nickname-input">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter a pro code"
            maxLength={64}
            className="fill"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button className="btn" disabled={!code.trim() || redeeming} onClick={redeem}>
            {redeeming ? (
              <>
                <Spinner /> Redeeming…
              </>
            ) : (
              "Redeem"
            )}
          </button>
        </div>
      </div>
      <p className="profile-info-caption">Have a pro code? Enter it to unlock pro tests for 30 days.</p>
      {error ? <p className="warn show">{error}</p> : null}
    </div>
  );
}
