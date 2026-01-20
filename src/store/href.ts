import { getInitialHref } from "../utils/href";

export interface HrefState {
  href: string | null;
  setHref: (href: string | null) => void;
}

const initialHref = getInitialHref();

export const createHrefSlice = (set) => ({
  href: initialHref,
  setHref: (href) =>
    set({
      href,
      input: href || "",
      value: null,
      collections: null,
      filteredCollections: null,
      hoveredCollection: null,
      hoveredItem: null,
      pickedItem: null,
      searchItems: null,
      geotiffHref: null,
    }),
});
