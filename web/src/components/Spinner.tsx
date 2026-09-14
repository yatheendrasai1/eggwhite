export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Full-section loading state for a page/panel waiting on a backend call. */
export function LoaderBlock({ label }: { label: string }) {
  return (
    <div className="loader-block">
      <Spinner size={22} />
      <p>{label}</p>
    </div>
  );
}
