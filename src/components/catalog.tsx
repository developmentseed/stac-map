import type { StacCatalog } from "stac-ts";
import { ChildCard, Children } from "./children";

export function Catalogs({ catalogs }: { catalogs: StacCatalog[] }) {
  return (
    <Children heading="Catalogs">
      {catalogs.map((catalog) => (
        <ChildCard child={catalog} key={"catalog-" + catalog.id}></ChildCard>
      ))}
    </Children>
  );
}
