import { useEffect } from "react";
import type { StacLink } from "stac-ts";
import { useStacJson } from "../../hooks/stac";
import { useStore } from "../../store";

export default function ChildLinks({ links }: { links: StacLink[] }) {
  return (
    <>
      {links.map((link) => (
        <ChildLink link={link} key={link.href} />
      ))}
    </>
  );
}

function ChildLink({ link }: { link: StacLink }) {
  const addCatalog = useStore((state) => state.addCatalog);
  const addCollection = useStore((state) => state.addCollection);
  const result = useStacJson({ href: link.href });

  useEffect(() => {
    if (result.data?.type === "Collection") addCollection(result.data);
    if (result.data?.type === "Catalog") addCatalog(result.data);
  }, [result.data, addCollection, addCatalog]);

  return null;
}
