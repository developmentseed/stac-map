import { useStore } from "@/store";
import { collectionToFeature } from "@/utils/stac";

export function useItems() {
  const staticItems = useStore((store) => store.staticItems);
  const searchedItems = useStore((store) => store.searchedItems);
  const itemSource = useStore((store) => store.itemSource);

  if (itemSource === "static" && staticItems) return staticItems;
  if (itemSource === "searched" && searchedItems)
    return searchedItems.flatMap((items) => items);
  return staticItems || searchedItems?.flatMap((items) => items) || null;
}

export function useCollectionBounds() {
  const collections = useStore((store) => store.collections);
  const filteredCollections = useStore((store) => store.filteredCollections);
  return (filteredCollections || collections)?.map((collection) =>
    collectionToFeature(collection)
  );
}
