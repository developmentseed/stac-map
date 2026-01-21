import { SkeletonText } from "@chakra-ui/react";
import Search from "./search";
import { useStac } from "../hooks/stac";
import type { StacValue } from "../types/stac";
import { getLinkHref } from "../utils/stac";

export default function Root({
  rootHref,
  value,
}: {
  rootHref: string;
  value: StacValue;
}) {
  const result = useStac({ href: rootHref });
  const searchHref = result.data ? getLinkHref(result.data, "search") : null;
  if (searchHref && value?.type === "Collection") {
    return <Search href={searchHref} collection={value} />;
  } else if (result.isFetching) {
    return <SkeletonText />;
  }
}
