import { Button, DownloadTrigger, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import { LuDownload } from "react-icons/lu";
import type { StacItem } from "stac-ts";
import { loadStacWasm } from "./stac-wasm-loader";

export default function ParquetExportButton({ items }: { items: StacItem[] }) {
  const [isExporting, setIsExporting] = useState(false);
  return (
    <DownloadTrigger
      fileName="items.parquet"
      mimeType="application/vnd.apache.parquet"
      data={async () => {
        try {
          setIsExporting(true);
          const stacWasm = await loadStacWasm();
          return new Blob([stacWasm.stacJsonToParquet(items) as BlobPart]);
        } finally {
          setIsExporting(false);
        }
      }}
      asChild
    >
      <Button disabled={isExporting}>
        {isExporting ? <Spinner size="xs" /> : <LuDownload />} stac-geoparquet
      </Button>
    </DownloadTrigger>
  );
}
