import type { UseFileUploadReturn } from "@chakra-ui/react";
import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query";
import { AsyncDuckDB, isParquetFile, useDuckDb } from "duckdb-wasm-kit";
import { useEffect } from "react";
import type { StacCatalog, StacCollection, StacItem, StacLink } from "stac-ts";
import { fetchStac, fetchStacLink } from "../http";
import type { TemporalFilter } from "../types/datetime";
import type {
  StacCollections,
  StacItemCollection,
  StacValue,
} from "../types/stac";

export function useStacValue({
  href,
  fileUpload,
}: {
  href: string | undefined;
  fileUpload?: UseFileUploadReturn;
  temporalFilter?: TemporalFilter;
}): {
  value?: StacValue;
  parquetPath?: string;
  collections: StacCollection[] | undefined;
  items: StacItem[];
} {
  const { db } = useDuckDb();
  const { data } = useStacValueQuery({ href, fileUpload, db });
  const { values: items } = useStacValues(
    data?.value.links?.filter((link) => link.rel == "item"),
  );
  const { collections } = useStacCollections(data?.value);

  return {
    value: data?.value,
    parquetPath: data?.parquetPath,
    collections,
    items: items.filter((item) => item.type == "Feature"),
  };
}

export function useStacLinkContainer(
  value: StacValue | undefined,
  rel: string,
) {
  const result = useStacValueQuery({
    href: value?.links?.find((link) => link.rel == rel)?.href,
  });
  if (
    result.data?.value.type == "Catalog" ||
    result.data?.value.type == "Collection"
  ) {
    return result.data?.value;
  } else {
    return undefined;
  }
}

export function useChildren(
  value: StacValue | undefined,
  includeCollections: boolean,
) {
  return useStacValues(
    value?.links?.filter((link) => link.rel == "child"),
  ).values.filter(
    (value) =>
      value.type == "Catalog" ||
      (includeCollections && value.type == "Collection"),
  ) as (StacCatalog | StacCollection)[];
}

function useStacValueQuery({
  href,
  fileUpload,
  db,
}: {
  href: string | undefined;
  fileUpload?: UseFileUploadReturn;
  db?: AsyncDuckDB;
}) {
  return useQuery<{
    value: StacValue;
    parquetPath: string | undefined;
  } | null>({
    queryKey: ["stac-value", href, fileUpload?.acceptedFiles],
    queryFn: async () => {
      if (href) {
        return await getStacValue(href, fileUpload, db);
      } else {
        return null;
      }
    },
    enabled: !!href,
  });
}

function useStacValues(links: StacLink[] | undefined) {
  const results = useQueries({
    queries:
      links?.map((link) => {
        return {
          queryKey: ["link", link],
          queryFn: () => fetchStacLink(link),
        };
      }) || [],
  });
  return {
    values: results
      .map((value) => value.data)
      .filter((value) => !!value) as StacValue[],
  };
}

function useStacCollections(value: StacValue | undefined) {
  const href = value?.links?.find((link) => link.rel == "data")?.href;
  const { data, isFetching, hasNextPage, fetchNextPage } =
    useInfiniteQuery<StacCollections | null>({
      queryKey: ["collections", href],
      enabled: !!href,
      queryFn: async ({ pageParam }) => {
        if (pageParam) {
          // @ts-expect-error Not worth templating stuff
          return await fetchStac(pageParam);
        } else {
          return null;
        }
      },
      initialPageParam: href,
      getNextPageParam: (lastPage: StacCollections | null) =>
        lastPage?.links?.find((link) => link.rel == "next")?.href,
    });

  useEffect(() => {
    if (!isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  return {
    collections: data?.pages.flatMap((page) => page?.collections || []),
  };
}

async function getStacValue(
  href: string,
  fileUpload: UseFileUploadReturn | undefined,
  db: AsyncDuckDB | undefined,
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
      if (db) {
        db.registerFileBuffer(href, new Uint8Array(await file.arrayBuffer()));
        return {
          value: getStacGeoparquetItemCollection(href),
          parquetPath: href,
        };
      } else {
        return null;
      }
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
