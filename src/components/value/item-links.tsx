import { useEffect } from "react";
import type { StacLink } from "stac-ts";
import { useStacJson } from "../../hooks/stac";
import { useStore } from "../../store";

export default function ItemLinks({ links }: { links: StacLink[] }) {
  return (
    <>
      {links.map((link) => (
        <ItemLink link={link} key={link.href} />
      ))}
    </>
  );
}

function ItemLink({ link }: { link: StacLink }) {
  const addItem = useStore((state) => state.addItem);
  const result = useStacJson({ href: link.href });

  useEffect(() => {
    if (result.data?.type === "Feature") addItem(result.data);
  }, [result.data, addItem]);

  return null;
}
