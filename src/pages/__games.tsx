import cutManifest from "../../games/_manifests/cut-games.manifest.json";
import goodManifest from "../../games/_manifests/good-word.manifest.json";
import sharedManifest from "../../games/_manifests/shared.manifest.json";
import originalManifest from "../../games/_manifests/original.manifest.json";
import { resolveOriginalScreens } from "@/games/original.resolve";

type Manifest = typeof cutManifest;

type BucketKey = "CUT_GAMES" | "GOOD_WORD" | "SHARED" | "ORIGINAL";

type BucketEntry = {
  key: BucketKey;
  manifest: Manifest;
};

const BUCKETS: BucketEntry[] = [
  { key: "CUT_GAMES", manifest: cutManifest },
  { key: "GOOD_WORD", manifest: goodManifest },
  { key: "SHARED", manifest: sharedManifest },
  { key: "ORIGINAL", manifest: originalManifest },
];

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  } catch (error) {
    // ignore
  }
  return timestamp;
}

function TopFiles({ manifest }: { manifest: Manifest }) {
  const topFiles = manifest.files.slice(0, 20);
  return (
    <ol className="game-discovery__file-list">
      {topFiles.map((file) => (
        <li key={file}>{file}</li>
      ))}
      {manifest.files.length > 20 ? (
        <li className="game-discovery__more">… {manifest.files.length - 20} more</li>
      ) : null}
    </ol>
  );
}

function OriginalHints() {
  const { hints } = originalManifest;
  const extras = (hints as Record<string, unknown>).extras as
    | Record<string, string[]>
    | undefined;

  return (
    <section className="game-discovery__original-hints">
      <h2>Original Home / Play / Rules candidates</h2>
      <div className="game-discovery__hint-columns">
        <div>
          <h3>Home</h3>
          <ul>
            {hints.home.map((path) => (
              <li key={`home-${path}`}>{path}</li>
            ))}
            {hints.home.length === 0 ? <li>None detected</li> : null}
          </ul>
        </div>
        <div>
          <h3>Play</h3>
          <ul>
            {hints.play.map((path) => (
              <li key={`play-${path}`}>{path}</li>
            ))}
            {hints.play.length === 0 ? <li>None detected</li> : null}
          </ul>
        </div>
        <div>
          <h3>Rules</h3>
          <ul>
            {hints.rules.map((path) => (
              <li key={`rules-${path}`}>{path}</li>
            ))}
            {hints.rules.length === 0 ? <li>None detected</li> : null}
          </ul>
        </div>
      </div>
      {extras ? (
        <div className="game-discovery__extras">
          <h3>Extra patterns</h3>
          <div className="game-discovery__hint-columns">
            {Object.entries(extras).map(([name, paths]) => (
              <div key={name}>
                <h4>{name}</h4>
                <ul>
                  {paths.map((path) => (
                    <li key={`${name}-${path}`}>{path}</li>
                  ))}
                  {paths.length === 0 ? <li>None detected</li> : null}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function OriginalResolutionDetails() {
  const screens = resolveOriginalScreens();
  const entries: {
    label: string;
    path?: string;
    href: string;
  }[] = [
    { label: "Home", path: screens.home, href: "#/sigil-syntax" },
    { label: "Play", path: screens.play, href: "#/sigil-syntax/play" },
    { label: "Rules", path: screens.rules, href: "#/sigil-syntax/rules" },
  ];

  return (
    <section className="game-discovery__original-resolution">
      <h2>Original screen resolver</h2>
      <ul>
        {entries.map(({ label, path, href }) => (
          <li key={label}>
            <strong>{label}:</strong> {path ? <code>{path}</code> : <em>Not resolved</em>} {" "}
            <a href={href}>Open</a>
          </li>
        ))}
      </ul>
      {screens.fallbacks.length ? (
        <div className="game-discovery__fallbacks">
          <h3>Fallback candidates</h3>
          <ul>
            {screens.fallbacks.map((file) => (
              <li key={file}>
                <code>{file}</code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {screens.debug.tried.length ? (
        <details>
          <summary>Debug attempts</summary>
          <pre>{screens.debug.tried.join("\n")}</pre>
        </details>
      ) : null}
    </section>
  );
}

export default function GamesDiagnosticsPage() {
  const total = BUCKETS.reduce((acc, entry) => acc + entry.manifest.files.length, 0);
  const generatedAt = formatTimestamp(originalManifest.generatedAt);

  return (
    <div className="game-discovery">
      <header>
        <h1>Game Discovery Diagnostics</h1>
        <p className="game-discovery__note">No files were moved; wrappers will import dynamically.</p>
        <p>Last generated: {generatedAt}</p>
        <nav className="game-discovery__links">
          <a href="#/sigil-syntax">#/sigil-syntax</a>
          <a href="#/sigil-syntax/play">#/sigil-syntax/play</a>
          <a href="#/sigil-syntax/rules">#/sigil-syntax/rules</a>
        </nav>
      </header>

      <section className="game-discovery__summary">
        <h2>Bucket counts</h2>
        <ul>
          {BUCKETS.map((entry) => (
            <li key={entry.key}>
              <strong>{entry.key}:</strong> {entry.manifest.files.length} files
            </li>
          ))}
        </ul>
        <p>Total classified files: {total}</p>
      </section>

      {BUCKETS.map((entry) => (
        <section key={`section-${entry.key}`} className="game-discovery__bucket">
          <h2>
            {entry.key} <small>(generated {formatTimestamp(entry.manifest.generatedAt)})</small>
          </h2>
          <TopFiles manifest={entry.manifest} />
        </section>
      ))}

      <OriginalResolutionDetails />
      <OriginalHints />
    </div>
  );
}
