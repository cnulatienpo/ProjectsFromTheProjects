#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const os = require("os");
const { pathToFileURL } = require("url");
const esbuild = require("esbuild");

async function main() {
    const args = process.argv.slice(2);
    const filtered = [];
    for (const arg of args) {
        if (arg === "--transpile-only") continue;
        filtered.push(arg);
    }
    if (filtered.length === 0) {
        console.error("ts-node stub: missing entry file");
        process.exit(1);
        return;
    }
    const entry = filtered[0];
    const rest = filtered.slice(1);
    const entryPath = path.resolve(entry);
    const source = fs.readFileSync(entryPath, "utf8");
    const result = await esbuild.transform(source, {
        loader: "ts",
        format: "esm",
        target: "es2020",
        sourcefile: entryPath
    });
    const tmpFile = path.join(os.tmpdir(), `ts-node-stub-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
    fs.writeFileSync(tmpFile, result.code, "utf8");
    try {
        const moduleUrl = pathToFileURL(tmpFile).href;
        const argv = [process.argv[0], entryPath, ...rest];
        const prevArgv = process.argv;
        process.argv = argv;
        await import(moduleUrl);
        process.argv = prevArgv;
    } finally {
        fs.unlink(tmpFile, () => {});
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
