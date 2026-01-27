import { useStore } from "@/store";
import { collectionToFeature } from "@/utils/stac";

export function useItems() {
  const unpagedItems = useStore((store) => store.unpagedItems);
  const pagedItems = useStore((store) => store.pagedItems);
  return unpagedItems || pagedItems?.flatMap((items) => items) || null;
}

export function useCollectionBounds() {
  const collections = useStore((store) => store.collections);
  return collections?.map((collection) => collectionToFeature(collection));
}

export function useGeotiffHref() {
  const geotiffHref = useStore((store) => store.geotiffHref);
  return geotiffHref;
}
