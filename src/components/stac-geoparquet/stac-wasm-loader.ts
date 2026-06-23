type StacWasmModule = typeof import("stac-wasm");

let cached: Promise<StacWasmModule> | undefined;

export function loadStacWasm(): Promise<StacWasmModule> {
  if (!cached) {
    cached = import("stac-wasm").catch((err) => {
      cached = undefined;
      throw err;
    });
  }
  return cached;
}

export function warmStacWasm(): void {
  const schedule =
    typeof globalThis.requestIdleCallback === "function"
      ? globalThis.requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 0);
  schedule(() => {
    loadStacWasm().catch(() => {
      // Errors surface to real callers when they invoke loadStacWasm() directly.
    });
  });
}
