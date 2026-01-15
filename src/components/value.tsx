import { Badge, Heading, HStack, Stack } from "@chakra-ui/react";
import Collections from "./collections";
import Description from "./description";
import Thumbnail from "./thumbnail";
import type { StacValue } from "../types/stac";
import {
  getStacValueTitle,
  getStacValueType,
  getThumbnailAsset,
} from "../utils/stac";

export default function Value({ value }: { value: StacValue }) {
  const collectionsHref: string | undefined = value.links?.find(
    (link) => link.rel == "data"
  )?.href;
  const version = value.stac_version as string | undefined;
  const thumbnailAsset = getThumbnailAsset(value);

  return (
    <Stack gap={4}>
      <Heading>{getStacValueTitle(value)}</Heading>
      <HStack>
        {value.id && (
          <Badge variant={"surface"}>{getStacValueType(value)}</Badge>
        )}
        {version && <Badge variant={"surface"}>{version}</Badge>}
      </HStack>
      {thumbnailAsset && <Thumbnail asset={thumbnailAsset} />}
      {"description" in value && (
        <Description description={value.description as string} />
      )}
      {collectionsHref && <Collections href={collectionsHref} />}
    </Stack>
  );
}
