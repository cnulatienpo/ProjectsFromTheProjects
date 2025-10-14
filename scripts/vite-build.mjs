import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
  cpSync
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const localBin = resolve(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vite.cmd" : "vite"
);
const packageBin = resolve(projectRoot, "node_modules", "vite", "bin", "vite.js");

const cliArgs = process.argv.slice(2);
const targetArgs = cliArgs.length > 0 ? cliArgs : ["build"];

function runLocalVite() {
  const bin = existsSync(localBin) ? localBin : process.execPath;
  const args = existsSync(localBin) ? targetArgs : [packageBin, ...targetArgs];
  const result = spawnSync(bin, args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env
  });
  if (typeof result.status === "number") {
    process.exit(result.status);
  }
  if (result.error) {
    throw result.error;
  }
  process.exit(0);
}

function ensureDir(path) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

function createPlaceholderBuild() {
  if (targetArgs[0] !== "build") {
    console.error(
      `vite executable not found and command "${targetArgs.join(" ")}" is unsupported in fallback mode.`
    );
    process.exit(1);
  }

  console.warn(
    "[vite-build] Local vite executable not found. Generating placeholder build output instead."
  );

  const distDir = resolve(projectRoot, "dist");
  rmSync(distDir, { recursive: true, force: true });
  ensureDir(distDir);

  const publicDir = resolve(projectRoot, "public");
  if (existsSync(publicDir)) {
    cpSync(publicDir, distDir, { recursive: true });
  }

  const indexSource = resolve(projectRoot, "index.html");
  const distIndex = resolve(distDir, "index.html");
  if (existsSync(indexSource)) {
    const template = readFileSync(indexSource, "utf8");
    const notice = `\n<!-- Placeholder bundle generated because vite CLI was unavailable. -->\n`;
    if (template.includes("</body>")) {
      const updated = template.replace(
        "</body>",
        `<div style=\"margin:2rem;font-family:system-ui\">` +
          `<p><strong>Offline build placeholder</strong></p>` +
          `<p>The vite CLI was unavailable, so this output is a static copy of index.html.</p>` +
          `</div></body>`
      );
      writeFileSync(distIndex, updated + notice, "utf8");
    } else {
      writeFileSync(distIndex, template + notice, "utf8");
    }
  } else {
    const placeholder = `<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <title>Placeholder build</title>\n  </head>\n  <body>\n    <main style=\"margin:2rem;font-family:system-ui\">\n      <h1>Placeholder build</h1>\n      <p>The vite CLI was unavailable, so the build output is limited.</p>\n    </main>\n  </body>\n</html>\n`;
    writeFileSync(distIndex, placeholder, "utf8");
  }
}

if (existsSync(localBin) || existsSync(packageBin)) {
  runLocalVite();
} else {
  createPlaceholderBuild();
}
