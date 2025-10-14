import cutManifest from "../../games/_manifests/cut-games.manifest.json";
import goodManifest from "../../games/_manifests/good-word.manifest.json";
import originalManifest from "../../games/_manifests/original.manifest.json";
import { resolveOriginalScreens } from "../games/original.resolve";

const MAX_FILES = 20;

type Manifest = typeof cutManifest;

type Bucket = {
  key: "CUT_GAMES" | "GOOD_WORD" | "ORIGINAL";
  manifest: Manifest;
};

const BUCKETS: Bucket[] = [
  { key: "CUT_GAMES", manifest: cutManifest },
  { key: "GOOD_WORD", manifest: goodManifest },
  { key: "ORIGINAL", manifest: originalManifest },
];

const ORIGINAL_ROUTES: Record<"home" | "play" | "rules", string> = {
  home: "#/sigil-syntax",
  play: "#/sigil-syntax/play",
  rules: "#/sigil-syntax/rules",
};

function ResolvedOriginalScreens() {
  const resolved = resolveOriginalScreens();
  const entries: Array<{ key: keyof typeof ORIGINAL_ROUTES; label: string }> = [
    { key: "home", label: "Home" },
    { key: "play", label: "Play" },
    { key: "rules", label: "Rules" },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Resolved ORIGINAL screens</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Live routes below point to the <a href="#/sigil-syntax">Sigil &amp; Syntax</a> wrappers; file paths show
          the selected components.
        </p>
      </div>
      <ul className="space-y-3 text-sm">
        {entries.map(({ key, label }) => {
          const path = resolved[key];
          return (
            <li
              key={key}
              className="rounded border border-neutral-200 p-3 dark:border-neutral-700"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-semibold uppercase tracking-wide text-neutral-500">
                  {label}
                </div>
                {path ? (
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <code className="break-all font-mono text-xs sm:text-sm">{path}</code>
                    <a className="underline" href={ORIGINAL_ROUTES[key]}>
                      Visit {label.toLowerCase()} route
                    </a>
                  </div>
                ) : (
                  <span className="text-neutral-500">No match selected</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {resolved.fallbacks.length ? (
        <div>
          <h3 className="text-md font-semibold uppercase tracking-wide text-neutral-500">
            Fallback queue
          </h3>
          <ol className="mt-2 space-y-1 text-sm">
            {resolved.fallbacks.map((file) => (
              <li key={file} className="break-all font-mono">
                {file}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function FilesList({ manifest }: { manifest: Manifest }) {
  const topFiles = manifest.files.slice(0, MAX_FILES);
  const remaining = Math.max(0, manifest.files.length - MAX_FILES);

  return (
    <ol className="space-y-1 text-sm">
      {topFiles.map((file) => (
        <li key={file} className="break-all font-mono">
          {file}
        </li>
      ))}
      {remaining > 0 ? (
        <li className="italic text-neutral-500 dark:text-neutral-400">
          … {remaining} more
        </li>
      ) : null}
    </ol>
  );
}

function OriginalHints() {
  const baseKeys: Array<keyof Manifest["hints"]> = ["home", "play", "rules"];
  const extras = Object.keys(originalManifest.hints).filter(
    (key) => !baseKeys.includes(key as keyof Manifest["hints"])
  );

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Original candidates</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Home, play, and rules guesses come directly from discovery patterns.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {baseKeys.map((key) => (
          <div key={key}>
            <h3 className="text-md font-semibold uppercase tracking-wide text-neutral-500">
              {key}
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {originalManifest.hints[key]?.length ? (
                originalManifest.hints[key]!.map((item) => (
                  <li key={`${key}-${item}`} className="break-all font-mono">
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-neutral-500">No matches</li>
              )}
            </ul>
          </div>
        ))}
      </div>
      {extras.length > 0 ? (
        <div>
          <h3 className="text-md font-semibold">Extra signals</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {extras.map((extraKey) => (
              <li key={extraKey}>
                <div className="font-semibold uppercase tracking-wide text-neutral-500">
                  {extraKey}
                </div>
                <ul className="ml-4 mt-1 space-y-1">
                  {originalManifest.hints[extraKey]?.length ? (
                    originalManifest.hints[extraKey]!.map((item) => (
                      <li key={`${extraKey}-${item}`} className="break-all font-mono">
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-neutral-500">No matches</li>
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export default function GamesDiagnosticPage() {
  const totalFiles = BUCKETS.reduce((sum, bucket) => sum + bucket.manifest.files.length, 0);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Game discovery buckets</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          No files were moved; wrappers will import dynamically.
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Manifest generated at {new Date(cutManifest.generatedAt).toLocaleString()}.
        </p>
        <nav className="flex flex-wrap gap-4 text-sm underline">
          <a href="#/sigil-syntax">#/sigil-syntax</a>
          <a href="#/sigil-syntax/play">#/sigil-syntax/play</a>
          <a href="#/sigil-syntax/rules">#/sigil-syntax/rules</a>
        </nav>
      </header>

      <section>
        <h2 className="text-xl font-semibold">Counts</h2>
        <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
          {BUCKETS.map(({ key, manifest }) => (
            <li key={key} className="flex items-center justify-between rounded border border-neutral-200 px-3 py-2 dark:border-neutral-700">
              <span className="font-semibold">{key}</span>
              <span className="font-mono">{manifest.files.length}</span>
            </li>
          ))}
          <li className="flex items-center justify-between rounded border border-neutral-200 px-3 py-2 font-semibold dark:border-neutral-700">
            <span>Total tracked</span>
            <span className="font-mono">{totalFiles}</span>
          </li>
        </ul>
      </section>

      <ResolvedOriginalScreens />

      <section className="space-y-8">
        {BUCKETS.map(({ key, manifest }) => (
          <article key={key} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{key}</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing up to {MAX_FILES} of {manifest.files.length} files.
              </p>
            </div>
            <FilesList manifest={manifest} />
          </article>
        ))}
      </section>

      <OriginalHints />
    </main>
  );
}
