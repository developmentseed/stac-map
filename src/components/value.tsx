import { Badge, Heading, HStack, Span, Stack } from "@chakra-ui/react";
import Collections from "./collections";
import Description from "./description";
import type { StacValue } from "../types/stac";
import { getStacValueTitle, getStacValueType } from "../utils/stac";

export default function Value({ value }: { value: StacValue }) {
  const collectionsHref: string | undefined = value.links?.find(
    (link) => link.rel == "data"
  )?.href;
  const version = value.stac_version as string | undefined;

  return (
    <Stack gap={4}>
      <Heading>
        <HStack>
          <Span mr={4}>{getStacValueTitle(value)}</Span>
          {value.id && (
            <Badge variant={"surface"}>{getStacValueType(value)}</Badge>
          )}
          {version && <Badge variant={"surface"}>{version}</Badge>}
        </HStack>
      </Heading>
      {"description" in value && (
        <Description description={value.description as string} />
      )}
      {collectionsHref && <Collections href={collectionsHref} />}
    </Stack>
  );
}
