import { Section } from "@/components/section";
import { useItems } from "@/hooks/store";
import { useStore } from "@/store";
import { getCollectionDatetimes } from "@/utils/stac";
import { Button, IconButton, Popover, Portal, Stack } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { LuEye, LuEyeClosed, LuFilter, LuFolderPlus } from "react-icons/lu";
import type { StacCollection } from "stac-ts";
import Filter from "./filter";
import CollectionsHref from "./href";
import CollectionList from "./list";
import Search from "./search";

export default function Collections({
  href,
  showSearch,
  collections,
}: {
  href: string | undefined;
  showSearch: boolean;
  collections: StacCollection[] | null;
}) {
  const filteredCollections = useStore((store) => store.filteredCollections);
  const setDatetimeBounds = useStore((store) => store.setDatetimeBounds);
  const visualizeCollections = useStore((store) => store.visualizeCollections);
  const setVisualizeCollections = useStore(
    (store) => store.setVisualizeCollections
  );
  const items = useItems();
  const hasItems = items && items.length > 0;

  const { collectionsToShow, title } = useMemo(() => {
    if (!collections) {
      return { collectionsToShow: null, title: "Collections" };
    }
    return {
      collectionsToShow: filteredCollections || collections,
      title: filteredCollections
        ? `Collections (${filteredCollections.length}/${collections.length})`
        : `Collections (${collections.length})`,
    };
  }, [filteredCollections, collections]);

  useEffect(() => {
    if (!collections) return;
    const bounds = collections.reduce(
      (acc, collection) => {
        const { start, end } = getCollectionDatetimes(collection);
        return {
          start: start
            ? acc.start
              ? Math.min(acc.start, start.getTime())
              : start.getTime()
            : acc.start,
          end: end
            ? acc.end
              ? Math.max(acc.end, end.getTime())
              : end.getTime()
            : acc.end,
        };
      },
      { start: null as number | null, end: null as number | null }
    );
    setDatetimeBounds({
      start: bounds.start ? new Date(bounds.start) : null,
      end: bounds.end ? new Date(bounds.end) : null,
    });
  }, [collections, setDatetimeBounds]);

  const headerAction = hasItems ? (
    <IconButton
      size="2xs"
      variant="ghost"
      aria-label={
        visualizeCollections
          ? "Hide collections on map"
          : "Show collections on map"
      }
      onClick={(e) => {
        e.stopPropagation();
        setVisualizeCollections(!visualizeCollections);
      }}
    >
      {visualizeCollections ? <LuEye /> : <LuEyeClosed />}
    </IconButton>
  ) : undefined;

  return (
    <Section
      icon={<LuFolderPlus />}
      title={title}
      headerAction={collections ? headerAction : undefined}
    >
      {(listOrCard) => (
        <Stack gap={4}>
          {showSearch && <Search />}
          {href && <CollectionsHref href={href} />}
          {collections && collectionsToShow && (
            <>
              {collections.length > 1 && (
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <Button variant="outline" size="sm">
                      <LuFilter /> Filter
                    </Button>
                  </Popover.Trigger>
                  <Portal>
                    <Popover.Positioner>
                      <Popover.Content>
                        <Popover.Arrow />
                        <Popover.Body>
                          <Filter collections={collections} />
                        </Popover.Body>
                      </Popover.Content>
                    </Popover.Positioner>
                  </Portal>
                </Popover.Root>
              )}
              <CollectionList
                collections={collectionsToShow}
                listOrCard={listOrCard}
              />
            </>
          )}
        </Stack>
      )}
    </Section>
  );
}
