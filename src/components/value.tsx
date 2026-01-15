import { LuArrowUp, LuArrowUpLeft } from "react-icons/lu";
import {
  Badge,
  Button,
  ButtonGroup,
  Heading,
  HStack,
  Stack,
} from "@chakra-ui/react";
import type { StacAsset } from "stac-ts";
import Assets from "./assets";
import Collections from "./collections";
import Description from "./description";
import Thumbnail from "./thumbnail";
import { useStore } from "../store";
import type { StacValue } from "../types/stac";
import {
  getLinkHref,
  getStacValueTitle,
  getStacValueType,
  getThumbnailAsset,
} from "../utils/stac";

export default function Value({ value }: { value: StacValue }) {
  const setHref = useStore((store) => store.setHref);
  const collectionsHref = getLinkHref(value, "data");
  const selfHref = getLinkHref(value, "self");
  const rootHref = getLinkHref(value, "root");
  const showRootHref = rootHref && rootHref !== selfHref;
  const parentHref = getLinkHref(value, "parent");
  const showParentHref = parentHref && parentHref !== rootHref;
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

      {(showRootHref || showParentHref) && (
        <HStack>
          <ButtonGroup variant={"outline"} size="xs">
            {rootHref && rootHref !== selfHref && (
              <Button onClick={() => setHref(rootHref)}>
                <LuArrowUpLeft />
                Root
              </Button>
            )}
            {parentHref && parentHref !== rootHref && (
              <Button onClick={() => setHref(parentHref)}>
                <LuArrowUp />
                Parent
              </Button>
            )}
          </ButtonGroup>
        </HStack>
      )}

      {thumbnailAsset && <Thumbnail asset={thumbnailAsset} />}
      {"description" in value && (
        <Description description={value.description as string} />
      )}

      {(value.assets as { [k: string]: StacAsset }) && (
        <Assets assets={value.assets as { [k: string]: StacAsset }} />
      )}

      {collectionsHref && <Collections href={collectionsHref} />}
    </Stack>
  );
}
