type Cql2WasmModule = typeof import("cql2-wasm");

let cached: Promise<Cql2WasmModule> | undefined;

export function loadCql2Wasm(): Promise<Cql2WasmModule> {
  if (!cached) {
    cached = import("cql2-wasm")
      .then(async (module) => {
        await module.default();
        return module;
      })
      .catch((err) => {
        cached = undefined;
        throw err;
      });
  }
  return cached;
}
