import React from "react";
import { useToast } from "../state/useToast";

export function ToastHost() {
  const toasts = useToast((state) => state.toasts);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center">
      <div className="space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow dark:border-neutral-700 dark:bg-neutral-900"
          >
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ToastHost;
