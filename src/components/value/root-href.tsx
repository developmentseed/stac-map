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
    return <Search href={searchHref} collection={value} />;
  }
}
