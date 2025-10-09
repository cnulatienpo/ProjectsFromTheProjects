/** Hybrid API boot:
 * - If VITE_PROD_API is set -> DON'T install shim; use real API.
 * - If not set (GitHub Pages / local demo) -> install client shim so /api/* works.
 */
export function shouldUseRealApi(): boolean {
    const base = import.meta.env.VITE_PROD_API?.toString().trim();
    return !!(base && /^https?:\/\//i.test(base));
}

export async function bootApi() {
    if (shouldUseRealApi()) {
        // Real API mode: nothing to do. Frontend will call import.meta.env.VITE_PROD_API.
        if (import.meta.env.DEV) console.info("[api-boot] Using real API at", import.meta.env.VITE_PROD_API);
        return;
    }
    // Static mode: install the in-browser shim
    try {
        const { installApiShim } = await import("./api-shim"); // <-- relative import, same folder
        installApiShim();
        if (import.meta.env.DEV) console.info("[api-boot] Installed API shim (static mode).");
    } catch (e) {
        console.error("[api-boot] Failed to install API shim:", e);
    }
}

export function apiBase(): string {
    // Consumers can call this to compose URLs if they ever need to bypass fetch.
    return (import.meta.env.VITE_PROD_API?.toString().trim() || "");
}
