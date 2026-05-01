import { useStacValue } from "@/hooks/stac";
import type { StacValue } from "@/types/stac";
import {
  conformsToFreeTextCollectionSearch,
  getLink,
  getStacTitle,
  getThumbnailAsset,
} from "@/utils/stac";
import { Badge, Box, Heading, HStack, Stack } from "@chakra-ui/react";
import { useMemo } from "react";
import type { StacLink } from "stac-ts";
import Breadcrumbs from "./breadcrumbs";
import Buttons from "./buttons";
import Collections from "./collections";
import Search from "./search";
import Description from "./ui/description";
import Thumbnail from "./ui/thumbnail";

export default function Value({ value }: { value: StacValue }) {
  const version = value.stac_version as string;
  const thumbnailAsset = getThumbnailAsset(value);
  const description = value.description as string;
  const collectionsLink = getLink(value, "data");
  const rootLink = getLink(value, "root");

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
