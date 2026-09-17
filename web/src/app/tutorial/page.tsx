import type { CSSProperties } from "react";
import { BackHome } from "@/components/BackHome";

const listStyle: CSSProperties = {
  margin: "10px 0 0",
  paddingLeft: 20,
  fontSize: 15.5,
  lineHeight: 1.55,
};

export default function TutorialPage() {
  return (
    <main className="page">
      <div className="wrap">
        <header className="masthead">
          <BackHome />
          <p className="eyebrow">Tutorial</p>
          <h1>
            How this <em>site</em> works
          </h1>
          <p className="lede">
            A quick guide to pro tests, activating pro access, flagging a score you disagree
            with, and the daily limits behind both.
          </p>
        </header>

        <div className="panel">
          <h3>1. What are pro tests and regular tests?</h3>
          <p className="q-text">
            <b>Regular tests</b> — vocabulary, grammar drills, multiple choice, and similar — are
            free, open to everyone, and graded instantly by fixed rules. The same answer always
            gets the same score.
          </p>
          <p className="q-text" style={{ marginTop: 12 }}>
            <b>Pro tests</b> — currently <b>The Translation Drama</b> and{" "}
            <b>Framing the Situation</b> — are free-text responses graded by an AI model against a
            rubric instead of an exact answer key. That&rsquo;s better at judging real writing, but it
            also makes grading a judgment call rather than a lookup — which is why these tests are
            gated behind Pro access, and why flagging (see below) exists for them.
          </p>
        </div>

        <div className="panel">
          <h3>2. How to get a pro code and activate pro tests</h3>
          <ol style={listStyle}>
            <li>Ask an admin for a pro code — codes are generated from the admin Dashboard.</li>
            <li>
              Open your profile (tap your initial in the top-right corner of the navbar) and find
              the <b>Pro code</b> field.
            </li>
            <li>
              Enter the code and hit <b>Redeem</b>.
            </li>
          </ol>
          <p className="q-text" style={{ marginTop: 12 }}>
            A valid, unused code unlocks pro tests for <b>30 days</b> from the moment you redeem
            it. Each code can only be redeemed once, and your profile shows the exact date pro
            access expires once it&rsquo;s active.
          </p>
        </div>

        <div className="panel">
          <h3>3. What is flagging in the test results?</h3>
          <p className="q-text">
            Since pro tests are AI-graded, the same answer can occasionally get graded slightly
            differently between attempts. If a score on a pro test&rsquo;s results page looks wrong,
            click <b>Flag this score</b> on that item and, optionally, add a short comment (up to
            100 characters) explaining what looks off.
          </p>
          <p className="q-text" style={{ marginTop: 12 }}>
            Flags stay only in your browser — nothing is sent anywhere until you click{" "}
            <b>Verify flagged results</b>, which re-grades the attempt and records what was
            disputed. If you navigate back to the home page while something is still flagged but
            not yet verified, you&rsquo;ll be asked to confirm, since going back discards it.
          </p>
        </div>

        <div className="panel">
          <h3>4. Limits on pro test submissions and verification</h3>
          <ul style={listStyle}>
            <li>
              <b>Submissions:</b> up to <b>4 pro test completions per day</b> (across all pro
              tests combined), resetting daily.
            </li>
            <li>
              <b>Verifications:</b> up to <b>3 &ldquo;Verify&rdquo; requests per test attempt</b>{" "}
              — this counts against the attempt, not against how many items you flag in it, so
              flagging 5 items and verifying once still only uses 1 of your 3.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
