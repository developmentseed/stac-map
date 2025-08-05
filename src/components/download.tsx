import { Button, ButtonGroup, DownloadTrigger } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
import type { StacItem } from "stac-ts";
import * as stac_wasm from "stac-wasm";

export default function DownloadButtons({
  items,
  disabled,
}: {
  items: StacItem[];
  disabled?: boolean;
}) {
  const downloadJson = () => {
    return JSON.stringify(
      items ? { type: "FeatureCollection", features: items } : {},
    );
  };
  const downloadStacGeoparquet = () => {
    return new Blob(items ? [stac_wasm.stacJsonToParquet(items)] : []);
  };

  return (
    <ButtonGroup variant={"subtle"} size={"sm"}>
      <DownloadTrigger
        data={downloadJson}
        fileName="search.json"
        mimeType="application/json"
        asChild
      >
        <Button disabled={disabled}>
          <LuDownload></LuDownload>
          json
        </Button>
      </DownloadTrigger>
      <DownloadTrigger
        data={downloadStacGeoparquet}
        fileName="search.parquet"
        mimeType="application/vnd.apache.parquet"
        asChild
      >
        <Button disabled={disabled}>
          <LuDownload></LuDownload>
          stac-geoparquet
        </Button>
      </DownloadTrigger>
    </ButtonGroup>
  );
}
