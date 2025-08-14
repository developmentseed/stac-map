import {
  Box,
  Breadcrumb,
  HStack,
  Icon,
  Text,
} from "@chakra-ui/react";
import {
  LuFile,
  LuFiles,
  LuFolder,
  LuFolderPlus,
} from "react-icons/lu";
import useStacMap from "../hooks/stac-map";

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
  collectionHref
}: {
  value: any;
  view: string;
  setHref: (href: string) => void;
  picked: any;
  root: any;
  parent: any;
  collection: any;
  selfHref?: string;
  rootHref?: string;
  parentHref?: string;
  collectionHref?: string;
}) {
  const { href } = useStacMap();
  const items = [];
  
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
      if (parentUrl.toString() === href || 
          (rootUrl && parentUrl.toString() === rootUrl.toString())) {
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
  
  if (value.type === "Catalog") {
    items.push({ 
      label: value.title || value.id || "Catalog", 
      href: selfHref,
      icon: LuFolder,
      active: view === "catalog"
    });
  } else if (value.type === "Collection") {
    if (rootUrl && root) {
      items.push({ 
        label: root.title || root.id || "Catalog", 
        href: rootUrl.toString(),
        icon: LuFolder,
        active: false
      });
    } else if (parentUrl && parent && parent.type === "Catalog") {
      items.push({ 
        label: parent.title || parent.id || "Catalog", 
        href: parentUrl.toString(),
        icon: LuFolder,
        active: false
      });
    }
    
    items.push({ 
      label: value.title || value.id || "Collection", 
      href: selfHref,
      icon: LuFolderPlus,
      active: view === "collection"
    });
  } else if (value.type === "Feature") {
    if (rootUrl && root) {
      items.push({ 
        label: root.title || root.id || "Catalog", 
        href: rootUrl.toString(),
        icon: LuFolder,
        active: false
      });
    }
    
    if (collectionUrl && collection) {
      const collectionSelfHref = collection.links?.find((link: { rel: string; href?: string }) => link.rel === "self")?.href;
      items.push({ 
        label: collection.title || collection.id || "Collection", 
        href: collectionSelfHref || collectionUrl.toString(),
        icon: LuFolderPlus,
        active: false
      });
    } else if (parentUrl && parent && parent.type === "Collection") {
      items.push({ 
        label: parent.title || parent.id || "Collection", 
        href: parentUrl.toString(),
        icon: LuFolderPlus,
        active: false
      });
    }
    
    items.push({ 
      label: value.properties?.title || value.id || "Item", 
      href: selfHref,
      icon: LuFile,
      active: view === "item"
    });
  } else if (value.type === "FeatureCollection") {
    items.push({ 
      label: "Search Results", 
      href: selfHref,
      icon: LuFiles,
      active: view === "collection"
    });
  }
  
  if (view === "picked" && picked) {
    if (items.length > 0) {
      items.forEach(item => item.active = false);
    }
    items.push({ 
      label: picked.properties?.title || picked.id || "Selected Item", 
      href: null,
      icon: LuFile,
      active: true
    });
  }
  
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {items.map((item, index) => (
          <Box key={index} display="contents">
            <Breadcrumb.Item>
              {item.active ? (
                <HStack gap={1}>
                  <Icon size="xs" color="fg.muted">
                    <item.icon />
                  </Icon>
                  <Breadcrumb.CurrentLink fontWeight="bolder" fontSize="large">
                    {item.label as string}
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
                    <Text>{item.label as string}</Text>
                  </HStack>
                </Breadcrumb.Link>
              )}
            </Breadcrumb.Item>
            {index < items.length - 1 && <Breadcrumb.Separator />}
          </Box>
        ))}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
