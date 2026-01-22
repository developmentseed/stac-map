import type { AsyncDuckDB } from "duckdb-wasm-kit";

export async function uploadFile({
  file,
  setUploadedFile,
  db,
}: {
  file: File;
  setUploadedFile: (file: File) => void;
  db: AsyncDuckDB | undefined;
}) {
  setUploadedFile(file);
  if (db && file.name.endsWith(".parquet"))
    db.registerFileBuffer(file.name, new Uint8Array(await file.arrayBuffer()));
}
