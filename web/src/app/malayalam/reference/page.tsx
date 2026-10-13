import { notFound } from "next/navigation";
import { BackHome } from "@/components/BackHome";
import { Markdown } from "@/components/malayalam/Markdown";
import { requireTivSession } from "@/lib/pro";
import { GRAMMAR_SECTIONS } from "@/lib/malayalam/grammar";

export const dynamic = "force-dynamic";

/** "4.10 Describing (Row 7, Part 1)" → "Describing" for the jump chips. */
function shortTitle(title: string): string {
  return title.replace(/^\d+(\.\d+)?\s*/, "").replace(/\s*\(.*\)$/, "");
}

export default async function MalayalamReferencePage() {
  if (!(await requireTivSession())) notFound();

  return (
    <main className="page">
      <div className="wrap">
        <header className="masthead">
          <BackHome />
          <h1>
            Grammar <em>reference</em>
          </h1>
          <p className="lede">Every rule so far, anchored to Telugu wherever a twin exists.</p>
        </header>

        <nav className="ml-jump" aria-label="Sections">
          {GRAMMAR_SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="ml-filter">
              {shortTitle(s.title)}
            </a>
          ))}
        </nav>

        {GRAMMAR_SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="panel ml-ref">
            <h3>{s.title}</h3>
            <Markdown source={s.md} />
          </section>
        ))}
      </div>
    </main>
  );
}
