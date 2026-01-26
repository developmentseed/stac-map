import { useStacJson } from "@/hooks/stac";
import type { StacValue } from "@/types/stac";
import { getLinkHref } from "@/utils/stac";
import Search from "./search";

export default function RootHref({
  href,
  value,
}: {
  href: string;
  value: StacValue;
}) {
  const result = useStacJson({ href });
  const searchHref = result.data ? getLinkHref(result.data, "search") : null;

  if (searchHref && value.type === "Collection") {
    const queryablesHref =
      result.data &&
      getLinkHref(
        result.data,
        "http://www.opengis.net/def/rel/ogc/1.0/queryables"
      );
    const collectionQueryablesHref = getLinkHref(
      value,
      "http://www.opengis.net/def/rel/ogc/1.0/queryables"
    );
    return (
      <Search
        href={searchHref}
        collection={value}
        queryablesHref={collectionQueryablesHref || queryablesHref}
      />
    );
  }
}
