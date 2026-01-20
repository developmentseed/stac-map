export interface GeotiffState {
  geotiffHref: string | null;
  setGeotiffHref: (geotiffHref: string | null) => void;
}

export const createGeotiffSlice = (set) => ({
  geotiffHref: null,
  setGeotiffHref: (geotiffHref) => set({ geotiffHref }),
});
