import { LuArrowUp, LuArrowUpLeft } from "react-icons/lu";
import {
  Badge,
  Button,
  ButtonGroup,
  Heading,
  HStack,
  Stack,
} from "@chakra-ui/react";
import Collections from "./collections";
import Description from "./description";
import Thumbnail from "./thumbnail";
import { useStore } from "../store";
import type { StacValue } from "../types/stac";
import {
  getStacValueTitle,
  getStacValueType,
  getThumbnailAsset,
} from "../utils/stac";

export default function Value({ value }: { value: StacValue }) {
  const setHref = useStore((store) => store.setHref);
  const collectionsHref: string | undefined = value.links?.find(
    (link) => link.rel == "data"
  )?.href;
  const selfHref: string | undefined = value.links?.find(
    (link) => link.rel === "self"
  )?.href;
  const rootHref: string | undefined = value.links?.find(
    (link) => link.rel === "root"
  )?.href;
  const parentHref: string | undefined = value.links?.find(
    (link) => link.rel === "parent"
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

      <HStack>
        <ButtonGroup variant={"surface"}>
          {rootHref && rootHref !== selfHref && (
            <Button size={"xs"} onClick={() => setHref(rootHref)}>
              <LuArrowUpLeft />
              Root
            </Button>
          )}
          {parentHref && parentHref !== rootHref && (
            <Button size={"xs"} onClick={() => setHref(parentHref)}>
              <LuArrowUp />
              Parent
            </Button>
          )}
        </ButtonGroup>
      </HStack>

      {collectionsHref && <Collections href={collectionsHref} />}
    </Stack>
  );
}
