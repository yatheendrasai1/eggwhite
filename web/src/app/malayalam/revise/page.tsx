import { notFound } from "next/navigation";
import { BackHome } from "@/components/BackHome";
import { RevisionRunner } from "@/components/malayalam/RevisionRunner";
import { requireTivSession } from "@/lib/pro";

export const dynamic = "force-dynamic";

export default async function MalayalamRevisePage() {
  if (!(await requireTivSession())) notFound();

  return (
    <main className="page">
      <div className="wrap">
        <header className="masthead">
          <BackHome />
          <h1>
            Revise <em>sentences</em>
          </h1>
          <p className="lede">
            Cover the English, produce the Malayalam, then check. Easiest first — mark the
            ones you miss and come back to them.
          </p>
        </header>
        <RevisionRunner />
      </div>
    </main>
  );
}
