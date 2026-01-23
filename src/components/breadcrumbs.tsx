import { Breadcrumb, HStack } from "@chakra-ui/react";
import { useStore } from "../store";
import type { StacValue } from "../types/stac";
import { getStacValueType } from "../utils/stac";
import { getLinkHref } from "../utils/stac";

export default function Breadcrumbs({ value }: { value: StacValue }) {
  const setHref = useStore((store) => store.setHref);
  const selfHref = getLinkHref(value, "self");
  const rootHref = getLinkHref(value, "root");
  const parentHref = getLinkHref(value, "parent");
  const collectionHref = getLinkHref(value, "collection");

  return (
    <Breadcrumb.Root size={"sm"}>
      <Breadcrumb.List>
        {rootHref && rootHref !== selfHref && (
          <>
            <Breadcrumb.Item>
              <Breadcrumb.Link
                onClick={(e) => {
                  e.preventDefault();
                  setHref(rootHref);
                }}
                href="#"
              >
                Root
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
          </>
        )}
        {parentHref &&
          parentHref !== rootHref &&
          parentHref !== collectionHref && (
            <>
              <Breadcrumb.Item>
                <Breadcrumb.Link
                  onClick={(e) => {
                    e.preventDefault();
                    setHref(parentHref);
                  }}
                  href="#"
                >
                  Parent
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
            </>
          )}
        {collectionHref && collectionHref !== rootHref && (
          <>
            <Breadcrumb.Item>
              <Breadcrumb.Link
                onClick={(e) => {
                  e.preventDefault();
                  setHref(collectionHref);
                }}
                href="#"
              >
                Collection
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
          </>
        )}
        <Breadcrumb.Item>
          <Breadcrumb.CurrentLink>
            <HStack>{getStacValueType(value)}</HStack>
          </Breadcrumb.CurrentLink>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
