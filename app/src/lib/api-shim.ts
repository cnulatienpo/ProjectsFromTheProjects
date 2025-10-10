export function installApiShim() {
    window.fetch = async (input, init) => {
        // mock responses for /api/* endpoints
        if (typeof input === "string" && input.startsWith("/api/")) {
            return new Response(JSON.stringify({ message: "Static shim response" }), {
                status: 200,
                headers: { "content-type": "application/json" }
            });
        }
        return fetch(input, init);
    };
}
