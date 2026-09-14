import Link from "next/link";

/** Consistent top-left "back to home" link, used at the top of every page. */
export function BackHome() {
  return (
    <p className="foot" style={{ margin: "0 0 12px", textAlign: "left" }}>
      <Link href="/" style={{ color: "var(--violet)" }}>
        ← Back to home page
      </Link>
    </p>
  );
}
