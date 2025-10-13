import Head from "next/head";
import Link from "next/link";

import { funhouseCatalog } from "../../games/fun_house_writing/funhouse_catalog";
import { resolveFunhouseDistortion } from "../../games/fun_house_writing/utils";

const funhousePrompts = funhouseCatalog.map((prompt) => ({
  id: prompt.id,
  title: prompt.title,
  description: prompt.description,
  distortion: resolveFunhouseDistortion(prompt.constraint_label, prompt.constraint_type),
}));

export default function FunhouseIndex() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
      <Head>
        <title>Funhouse Prompt Menu</title>
        <meta
          name="description"
          content="Pick your writing distortion challenge from the Funhouse prompt menu."
        />
      </Head>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">🎭 Funhouse Prompt Menu</h1>
        <p className="max-w-2xl text-gray-600">
          Choose your distortion, embrace the chaos, and write the scene the wrong way on purpose.
          Each challenge links to a ready-to-play Funhouse prompt.
        </p>
        <p className="text-sm text-gray-500">
          Explore {funhousePrompts.length} remixed prompts pulled from real craft lessons.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {funhousePrompts.map((prompt) => (
          <li key={prompt.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">
              <Link href={`/funhouse/${prompt.id}`} className="text-blue-700 hover:underline">
                {prompt.title}
              </Link>
            </h2>
            <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-700">
              <span className="rounded-full bg-purple-100 px-2 py-1 text-[0.65rem] text-purple-800">
                Distortion
              </span>
              {prompt.distortion}
            </p>
            <p className="mt-3 text-sm text-gray-700">{prompt.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
