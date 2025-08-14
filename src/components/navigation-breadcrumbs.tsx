import { Box, Breadcrumb, HStack, Icon, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { LuFile, LuFiles, LuFolder, LuFolderPlus } from "react-icons/lu";
import type { StacItem } from "stac-ts";
import useStacMap from "../hooks/stac-map";
import type { StacValue } from "../types/stac";
import type { IconType } from "react-icons/lib";

interface BreadcrumbItem {
  label: string;
  href: string | null;
  icon: IconType;
  active: boolean;
}

export function NavigationBreadcrumbs({
  value,
  view,
  setHref,
  picked,
  root,
  parent,
  collection,
  selfHref,
  rootHref,
  parentHref,
  collectionHref,
}: {
  value: StacValue | undefined;
  view: string;
  setHref: (href: string) => void;
  picked: StacItem | undefined;
  root: StacValue | undefined;
  parent: StacValue | undefined;
  collection: StacValue | undefined;
  selfHref?: string;
  rootHref?: string;
  parentHref?: string;
  collectionHref?: string;
}) {
  const { href } = useStacMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showEllipsis, setShowEllipsis] = useState(false);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);

  const items: BreadcrumbItem[] = [];

  let rootUrl: URL | undefined;
  let parentUrl: URL | undefined;
  let collectionUrl: URL | undefined;

  if (rootHref) {
    try {
      rootUrl = new URL(rootHref, selfHref);
      if (rootUrl.toString() === selfHref) {
        rootUrl = undefined;
      }
    } catch {
      rootUrl = { toString: () => rootHref } as URL;
    }
  }

  if (parentHref) {
    try {
      parentUrl = new URL(parentHref, selfHref);
      if (
        parentUrl.toString() === href ||
        (rootUrl && parentUrl.toString() === rootUrl.toString())
      ) {
        parentUrl = undefined;
      }
    } catch {
      parentUrl = { toString: () => parentHref } as URL;
    }
  }

  if (collectionHref) {
    try {
      collectionUrl = new URL(collectionHref, selfHref);
    } catch {
      collectionUrl = { toString: () => collectionHref } as URL;
    }
  }

  if (value?.type === "Catalog") {
    items.push({
      label: value.title || value.id || "Catalog",
      href: selfHref || null,
      icon: LuFolder,
      active: view === "catalog",
    });
  } else if (value?.type === "Collection") {
    if (rootUrl && root) {
      items.push({
        label: (root.title as string) || root.id || "Catalog",
        href: rootUrl.toString(),
        icon: LuFolder,
        active: false,
      });
    } else if (parentUrl && parent && parent.type === "Catalog") {
      items.push({
        label: (parent.title as string) || parent.id || "Catalog",
        href: parentUrl.toString(),
        icon: LuFolder,
        active: false,
      });
    }

    items.push({
      label: value.title || value.id || "Collection",
      href: selfHref || null,
      icon: LuFolderPlus,
      active: view === "collection",
    });
  } else if (value?.type === "Feature") {
    if (rootUrl && root) {
      items.push({
        label: (root.title as string) || root.id || "Catalog",
        href: rootUrl.toString(),
        icon: LuFolder,
        active: false,
      });
    }

    if (collectionUrl && collection) {
      const collectionSelfHref = collection.links?.find(
        (link: { rel: string; href?: string }) => link.rel === "self",
      )?.href;
      items.push({
        label: (collection.title as string) || collection.id || "Collection",
        href: collectionSelfHref || collectionUrl.toString(),
        icon: LuFolderPlus,
        active: false,
      });
    } else if (parentUrl && parent && parent.type === "Collection") {
      items.push({
        label: parent.title || parent.id || "Collection",
        href: parentUrl.toString(),
        icon: LuFolderPlus,
        active: false,
      });
    }

    items.push({
      label: value.properties?.title || value.id || "Item",
      href: selfHref || null,
      icon: LuFile,
      active: view === "item",
    });
  } else if (value?.type === "FeatureCollection") {
    items.push({
      label: "Search Results",
      href: selfHref || null,
      icon: LuFiles,
      active: view === "collection",
    });
  }

  if (view === "picked" && picked) {
    if (items.length > 0) {
      items.forEach((item) => (item.active = false));
    }
    items.push({
      label: picked.properties?.title || picked.id || "Selected Item",
      href: null,
      icon: LuFile,
      active: true,
    });
  }

  useEffect(() => {
    const checkWidth = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const MAX_WIDTH = 500;

      if (containerWidth > MAX_WIDTH && items.length > 2) {
        setShowEllipsis(true);
        // show ellipses instead of text from the beginning
        setVisibleStartIndex(Math.max(0, items.length - 2));
      } else {
        setShowEllipsis(false);
        setVisibleStartIndex(0);
      }
    };

    checkWidth();

    const resizeObserver = new ResizeObserver(checkWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [items.length]);

  const visibleItems = showEllipsis ? items.slice(visibleStartIndex) : items;
  const hiddenItems = showEllipsis ? items.slice(0, visibleStartIndex) : [];

  return (
    <Box ref={containerRef}>
      <Breadcrumb.Root>
        <Breadcrumb.List>
          {showEllipsis && hiddenItems.length > 0 && (
            <>
              <Breadcrumb.Item>
                <Breadcrumb.Ellipsis />
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
            </>
          )}

          {visibleItems.map((item, index) => {
            const actualIndex = showEllipsis
              ? index + visibleStartIndex
              : index;
            return (
              <Box key={actualIndex} display="contents">
                <Breadcrumb.Item>
                  {item.active ? (
                    <HStack gap={1}>
                      <Icon size="xs" color="fg.muted">
                        <item.icon />
                      </Icon>
                      <Breadcrumb.CurrentLink
                        fontWeight="bolder"
                        fontSize="large"
                      >
                        {item.label}
                      </Breadcrumb.CurrentLink>
                    </HStack>
                  ) : (
                    <Breadcrumb.Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.href) {
                          setHref(item.href);
                        }
                      }}
                    >
                      <HStack gap={1}>
                        <Icon size="xs" color="fg.muted">
                          <item.icon />
                        </Icon>
                        <Text>{item.label}</Text>
                      </HStack>
                    </Breadcrumb.Link>
                  )}
                </Breadcrumb.Item>
                {index < visibleItems.length - 1 && <Breadcrumb.Separator />}
              </Box>
            );
          })}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </Box>
  );
}
