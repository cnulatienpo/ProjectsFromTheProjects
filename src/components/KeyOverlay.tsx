import React, { useEffect, useState } from "react";

export function KeyOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "?") {
        setOpen((value) => !value);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-3 right-3 rounded-full border border-neutral-300 bg-white/80 px-3 py-2 text-sm backdrop-blur transition hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/80"
        aria-label="Show keyboard shortcuts"
      >
        ?
      </button>
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Keyboard</h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <b>1</b> — I used it (+10)
              </li>
              <li>
                <b>2</b> — I learned it (+5)
              </li>
              <li>
                <b>3</b> — Skip (0)
              </li>
              <li>
                <b>?</b> — Toggle this help
              </li>
            </ul>
            <div className="mt-3 text-right">
              <button
                type="button"
                className="rounded-md border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default KeyOverlay;
