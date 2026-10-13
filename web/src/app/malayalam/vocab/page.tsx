import { notFound } from "next/navigation";
import { BackHome } from "@/components/BackHome";
import { VocabBrowser } from "@/components/malayalam/VocabBrowser";
import { requireTivSession } from "@/lib/pro";
import { VOCAB_COUNT } from "@/lib/malayalam/vocab";

export const dynamic = "force-dynamic";

export default async function MalayalamVocabPage() {
  if (!(await requireTivSession())) notFound();

  return (
    <main className="page">
      <div className="wrap">
        <header className="masthead">
          <BackHome />
          <h1>
            Vocabulary <em>bank</em>
          </h1>
          <p className="lede">
            {VOCAB_COUNT} words so far — survival needs ~300. Always learn them inside a sentence.
          </p>
        </header>
        <VocabBrowser />
      </div>
    </main>
  );
}
