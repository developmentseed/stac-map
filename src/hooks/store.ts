import { useStore } from "@/store";
import { useMemo } from "react";

export function useItems() {
  const unpagedItems = useStore((store) => store.unpagedItems);
  const pagedItems = useStore((store) => store.pagedItems);
  return useMemo(() => {
    return unpagedItems || pagedItems?.flatMap((items) => items) || null;
  }, [unpagedItems, pagedItems]);
}
