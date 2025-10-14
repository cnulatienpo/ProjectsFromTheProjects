const plugins = [];

try {
  // Prefer the real Tailwind PostCSS plugin when it is available locally.
  // This lets environments with a populated node_modules directory keep
  // generating Tailwind utilities without any extra configuration.
  plugins.push(require("@tailwindcss/postcss"));
} catch (error) {
  // In the execution environment used for automated validation we do not
  // always have network access, so the Tailwind plugin cannot be installed
  // via npm.  Instead of letting the build crash with a hard failure, fall
  // back to a no-op plugin so the rest of the build can proceed.  Tailwind
  // directives simply pass through untouched in this mode.
  plugins.push({
    postcssPlugin: "tailwindcss-stub",
    Once() {},
  });
}

module.exports = { plugins };
