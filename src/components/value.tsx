import { Stack } from "@chakra-ui/react";
import Collections from "./collections";
import Description from "./description";
import type { StacValue } from "../types/stac";

export default function Value({ value }: { value: StacValue }) {
  const collectionsHref: string | undefined = value.links?.find(
    (link) => link.rel == "data"
  )?.href;

  return (
    <Stack gap={4}>
      {"description" in value && (
        <Description description={value.description as string} />
      )}
      {collectionsHref && <Collections href={collectionsHref} />}
    </Stack>
  );
}
