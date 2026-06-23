export async function uploadFile({
  file,
  setUploadedFile,
  registerParquet,
}: {
  file: File;
  setUploadedFile: (file: File) => void;
  registerParquet?: (file: File) => Promise<void>;
}) {
  if (registerParquet && file.name.endsWith(".parquet")) {
    await registerParquet(file);
  }
  setUploadedFile(file);
}
