import { useStacValue } from "@/hooks/stac";
import { useStore } from "@/store";
import type { StacValue } from "@/types/stac";
import {
  conformsToFreeTextCollectionSearch,
  getLink,
  getSpatialExtent,
  getStacTitle,
  getThumbnailAsset,
  sanitizeBbox,
} from "@/utils/stac";
import { Badge, Box, Heading, HStack, Stack } from "@chakra-ui/react";
import bbox from "@turf/bbox";
import type { FeatureCollection } from "geojson";
import { useEffect, useMemo } from "react";
import type { StacLink } from "stac-ts";
import Breadcrumbs from "./breadcrumbs";
import Buttons from "./buttons";
import Collections from "./collections";
import Search from "./search";
import Description from "./ui/description";
import Thumbnail from "./ui/thumbnail";

export default function Value({ value }: { value: StacValue }) {
  const setValueBbox = useStore((store) => store.setValueBbox);
  const version = value.stac_version as string;
  const thumbnailAsset = getThumbnailAsset(value);
  const description = value.description as string;
  const collectionsLink = getLink(value, "data");
  const rootLink = getLink(value, "root");

  useEffect(() => {
    switch (value.type) {
      case "Collection":
        setValueBbox(sanitizeBbox(getSpatialExtent(value)));
        break;
      case "Feature":
        setValueBbox(sanitizeBbox(value.bbox) || null);
        break;
      case "FeatureCollection":
        setValueBbox(sanitizeBbox(bbox(value as FeatureCollection)));
        break;
    }
  }, [value, setValueBbox]);

  return (
    <Stack>
      <Heading>
        <HStack gap={4}>
          {getStacTitle(value)}
          {version && <Badge variant={"surface"}>{version}</Badge>}
        </HStack>
      </Heading>
      <Breadcrumbs value={value} />
      {thumbnailAsset && <Thumbnail asset={thumbnailAsset} />}
      {description && <Description description={description} />}
      <Buttons value={value} />

      <Box my={2} />

      {collectionsLink && (
        <Collections
          link={collectionsLink}
          hasCollectionSearch={conformsToFreeTextCollectionSearch(value)}
        />
      )}
      {rootLink && <Root link={rootLink} value={value} />}
    </Stack>
  );
}

function Root({ value, link }: { value: StacValue; link: StacLink }) {
  const result = useStacValue({ href: link.href });

  const searchLink = useMemo(() => {
    return result.data && getLink(result.data, "search");
  }, [result]);

  return searchLink && value.type === "Collection" ? (
    <Search link={searchLink} collection={value} />
  ) : null;
}
