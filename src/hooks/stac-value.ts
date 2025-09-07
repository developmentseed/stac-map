import type { UseFileUploadReturn } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { AsyncDuckDB, isParquetFile, useDuckDb } from "duckdb-wasm-kit";
import { fetchStac } from "../http";
import type { StacItemCollection, StacValue } from "../types/stac";

export default function useStacValue(
  href: string | undefined,
  fileUpload?: UseFileUploadReturn | undefined,
  types?: ("Catalog" | "Collection" | "FeatureCollection" | "Feature")[],
) {
  const { db } = useDuckDb();
  const { data } = useQuery<{
    value: StacValue;
    parquetPath: string | undefined;
  } | null>({
    queryKey: ["stac-value", href, fileUpload?.acceptedFiles],
    queryFn: async () => {
      if (href && db) {
        return await getStacValue(href, fileUpload, db);
      } else {
        return null;
      }
    },
    enabled: !!(href && db),
  });

  let value = data?.value;
  if (value && types) {
    if (!types.includes(value.type)) {
      value = undefined;
    }
  }

  return { value, parquetPath: data?.parquetPath };
}

async function getStacValue(
  href: string,
  fileUpload: UseFileUploadReturn | undefined,
  db: AsyncDuckDB,
) {
  if (isUrl(href)) {
    // TODO allow this to be forced
    if (href.endsWith(".parquet")) {
      return {
        value: getStacGeoparquetItemCollection(href),
        parquetPath: href,
      };
    } else {
      return {
        value: await fetchStac(href),
        parquetPath: undefined,
      };
    }
  } else if (fileUpload?.acceptedFiles.length == 1) {
    const file = fileUpload.acceptedFiles[0];
    if (await isParquetFile(file)) {
      db.registerFileBuffer(href, new Uint8Array(await file.arrayBuffer()));
      return {
        value: getStacGeoparquetItemCollection(href),
        parquetPath: href,
      };
    } else {
      return {
        value: JSON.parse(await file.text()),
        parquetPath: undefined,
      };
    }
  } else {
    throw new Error(
      `Href '${href}' is not a URL, but there is not one (and only one) uploaded, accepted file`,
    );
  }
}

function getStacGeoparquetItemCollection(href: string): StacItemCollection {
  return {
    type: "FeatureCollection",
    features: [],
    title: href.split("/").pop(),
    description: "A stac-geoparquet file",
  };
}

function isUrl(href: string) {
  try {
    new URL(href);
    return true;
  } catch {
    return false;
  }
}
