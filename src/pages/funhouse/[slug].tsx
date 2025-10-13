import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/router";

import FunhouseGameShell from "../../components/FunhouseGameShell";
import { funhouseCatalog } from "../../games/fun_house_writing/funhouse_catalog";
import { resolveFunhouseDistortion } from "../../games/fun_house_writing/utils";

function resolveMode(gameType?: string): string {
  if (!gameType) {
    return "text";
  }

  if (gameType === "experimental") {
    return "freeform";
  }

  return "text";
}

export default function FunhousePromptPage() {
  const router = useRouter();
  const slugParam = router.query.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  const prompt = useMemo(() => {
    if (!slug) {
      return undefined;
    }

    return funhouseCatalog.find((entry) => entry.id === slug);
  }, [slug]);

  if (!router.isReady) {
    return (
      <div className="p-6 text-gray-500">
        Loading prompt…
      </div>
    );
  }

  if (!slug || !prompt) {
    return <FunhousePromptNotFound />;
  }

  return (
    <>
      <Head>
        <title>{`${prompt.title} | Funhouse Prompt`}</title>
        {prompt.description ? <meta name="description" content={prompt.description} /> : null}
      </Head>
      <FunhouseGameShell
        title={prompt.title}
        lessonId={prompt.mirrors_lesson_id ?? "unknown-lesson"}
        mode={resolveMode(prompt.game_type)}
        distortion={resolveFunhouseDistortion(prompt.constraint_label, prompt.constraint_type)}
        description={prompt.description}
        promptText={prompt.prompt_text}
      />
    </>
  );
}

function FunhousePromptNotFound() {
  return (
    <>
      <Head>
        <title>Funhouse Prompt Not Found</title>
      </Head>
      <div className="space-y-2 p-6">
        <p className="text-lg font-semibold">Prompt not found 😢</p>
        <Link className="text-sm text-blue-600 underline-offset-2 hover:underline" href="/funhouse">
          Back to Funhouse hub
        </Link>
      </div>
    </>
  );
}
