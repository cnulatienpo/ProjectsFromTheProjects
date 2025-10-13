import Link from "next/link";
import Head from "next/head";

interface FunhousePrompt {
  slug: string;
  title: string;
  distortion: string;
  description: string;
}

const funhousePrompts: ReadonlyArray<FunhousePrompt> = [
  {
    slug: "bad-love-letter",
    title: "Write a Bad Love Letter",
    distortion: "Opposite Emotion",
    description: "Write a love letter using only violent, inappropriate, or unromantic language.",
  },
  {
    slug: "no-dialogue-drama",
    title: "Scene With No Dialogue",
    distortion: "Constraint Play",
    description: "Write a dramatic argument between two characters without using dialogue.",
  },
  {
    slug: "genre-swap-misery",
    title: "Rewrite in the Wrong Genre",
    distortion: "Genre Swap",
    description: "Rewrite a tragic scene as if it were a comedy sketch. Think banana peels and fart jokes.",
  },
  {
    slug: "wrong-pov-rescue",
    title: "Rescue Scene in the Wrong POV",
    distortion: "POV Inversion",
    description: "Write a dramatic rescue scene from the point of view of an object in the room.",
  },
  {
    slug: "villain-monologue-mixup",
    title: "Villain Monologue Remix",
    distortion: "Perspective Clash",
    description: "Rewrite a villain's triumphant speech as though it were an anxious best friend's pep talk.",
  },
  {
    slug: "metaphor-meltdown",
    title: "Metaphor Meltdown",
    distortion: "Overload",
    description: "Describe a simple action using an absurd chain of clashing metaphors that never quite land.",
  },
];

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
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {funhousePrompts.map((prompt) => (
          <li key={prompt.slug} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">
              <Link href={`/funhouse/${prompt.slug}`} className="text-blue-700 hover:underline">
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
