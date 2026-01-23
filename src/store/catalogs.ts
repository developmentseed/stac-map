import type { StacCatalog } from "stac-ts";
import type { StateCreator } from "zustand";
import type { State } from ".";

export interface CatalogsState {
  catalogs: StacCatalog[] | null;
  setCatalogs: (catalogs: StacCatalog[] | null) => void;
  addCatalog: (catalog: StacCatalog) => void;
}

export const createCatalogsSlice: StateCreator<State, [], [], CatalogsState> = (
  set,
  get
) => ({
  catalogs: null,
  setCatalogs: (catalogs) => set({ catalogs }),
  addCatalog: (catalog) => {
    const catalogs = get().catalogs;
    if (!catalogs?.find((c) => c.id == catalog.id)) {
      set({ catalogs: [...(catalogs || []), catalog] });
    }
  },
});
