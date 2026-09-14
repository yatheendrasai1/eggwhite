import { LoaderBlock } from "@/components/Spinner";

export default function Loading() {
  return (
    <main className="page">
      <div className="wrap">
        <LoaderBlock label="Loading archive…" />
      </div>
    </main>
  );
}
