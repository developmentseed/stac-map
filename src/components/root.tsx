import { SkeletonText } from "@chakra-ui/react";
import Search from "./search";
import { useStacJson } from "../hooks/stac";
import { useStore } from "../store";
import { getLinkHref } from "../utils/stac";

export default function Root({ href }: { href: string }) {
  const value = useStore((store) => store.value);
  const result = useStacJson({ href });
  const searchHref = result.data ? getLinkHref(result.data, "search") : null;
  if (searchHref && value?.type === "Collection") {
    return <Search href={searchHref} collection={value} />;
  } else if (result.isFetching) {
    return <SkeletonText />;
  }
}
