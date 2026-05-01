import type { StacValue } from "@/types/stac";
import { getLink, getStacTitle, getThumbnailAsset } from "@/utils/stac";
import { Badge, Heading, HStack, Separator, Stack } from "@chakra-ui/react";
import Breadcrumbs from "./breadcrumbs";
import Buttons from "./buttons";
import Collections from "./collections";
import Description from "./ui/description";
import Thumbnail from "./ui/thumbnail";

export default function Value({ value }: { value: StacValue }) {
  const version = value.stac_version as string;
  const thumbnailAsset = getThumbnailAsset(value);
  const description = value.description as string;
  const collectionsLink = getLink(value, "data");

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

      <Separator my={2} />

      {collectionsLink && <Collections link={collectionsLink} />}
    </Stack>
  );
}
