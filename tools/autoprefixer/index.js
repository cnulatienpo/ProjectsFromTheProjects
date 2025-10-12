// A minimal no-op Autoprefixer substitute for offline builds.
// It simply returns the CSS as-is while providing the same API surface
// used by Tailwind's default PostCSS pipeline.
export default function autoprefixer() {
  return {
    postcssPlugin: 'autoprefixer',
    Once() {
      // no-op
    }
  };
}

autoprefixer.postcss = true;
