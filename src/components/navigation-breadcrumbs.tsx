import { Breadcrumb, HStack } from "@chakra-ui/react";
import { useEffect, useState, type ReactNode } from "react";
import { LuFile, LuFiles, LuFolder, LuFolderPlus } from "react-icons/lu";
import useStacMap from "../hooks/stac-map";
import type { StacValue } from "../types/stac";

export function NavigationBreadcrumbs() {
  const { value, parent, root, picked, setHref } = useStacMap()!;
  const [breadcrumbs, setBreadcrumbs] = useState<ReactNode>();

  useEffect(() => {
    const breadcrumbs = [];
    if (value) {
      if (root && !hasSameHref(root, value)) {
        breadcrumbs.push(
          <BreadcrumbItem
            value={root}
            key={"breadcrumb-root"}
            text={"Root"}
            setHref={setHref}
          />,
        );
      }
      if (
        parent &&
        !hasSameHref(parent, value) &&
        (!root || !hasSameHref(root, parent))
      ) {
        breadcrumbs.push(
          <BreadcrumbItem
            value={parent}
            key={"breadcrumb-parent"}
            text={"Parent"}
            setHref={setHref}
          />,
        );
      }
      breadcrumbs.push(
        <BreadcrumbItem
          value={value}
          key={"breadcrumb-value"}
          text={getValueType(value)}
          setHref={setHref}
          current={!picked}
          clearPicked={true}
        />,
      );
      if (picked) {
        breadcrumbs.push(
          <BreadcrumbItem
            value={picked}
            key={"breadcrumb-picked"}
            text={"Picked " + getValueType(picked)}
            setHref={setHref}
            current={true}
          />,
        );
      }
    }
    setBreadcrumbs(
      breadcrumbs.flatMap((value, i) => [
        value,
        i < breadcrumbs.length - 1 && (
          <Breadcrumb.Separator key={"separator-" + i} />
        ),
      ]),
    );
  }, [value, parent, root, picked, setHref]);

  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>{breadcrumbs}</Breadcrumb.List>
    </Breadcrumb.Root>
  );
}

function BreadcrumbItem({
  value,
  text,
  setHref,
  current = false,
  clearPicked = false,
}: {
  value: StacValue;
  text: string;
  setHref: (href: string | undefined) => void;
  current?: boolean;
  clearPicked?: boolean;
}) {
  const { setPicked } = useStacMap()!;
  const href = value.links?.find((link) => link.rel == "self")?.href;
  return (
    <Breadcrumb.Item>
      {(current && (
        <Breadcrumb.CurrentLink>
          <HStack>
            {getValueIcon(value)({})}
            {text}
          </HStack>
        </Breadcrumb.CurrentLink>
      )) || (
        <Breadcrumb.Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (clearPicked) {
              setPicked(undefined);
            } else if (href) {
              setHref(href);
            }
          }}
        >
          {getValueIcon(value)({})}
          {text}
        </Breadcrumb.Link>
      )}
    </Breadcrumb.Item>
  );
}

function getValueIcon(value: StacValue) {
  switch (value.type) {
    case "Catalog":
      return LuFolder;
    case "Collection":
      return LuFolderPlus;
    case "Feature":
      return LuFile;
    case "FeatureCollection":
      return LuFiles;
  }
}

function getValueType(value: StacValue) {
  switch (value.type) {
    case "Catalog":
      return "Catalog";
    case "Collection":
      return "Collection";
    case "Feature":
      return "Item";
    case "FeatureCollection":
      return "ItemCollection";
  }
}

function hasSameHref(a: StacValue, b: StacValue) {
  const aHref = a.links?.find((link) => link.rel == "self")?.href;
  const bHref = b.links?.find((link) => link.rel == "self")?.href;
  return aHref && bHref && aHref === bHref;
}
