import type { StateCreator } from "zustand";
import type { State } from ".";

export interface UploadedFileState {
  uploadedFile: File | null;
  setUploadedFile: (uploadedFile: File) => void;
}

export const createUploadedFileSlice: StateCreator<
  State,
  [],
  [],
  UploadedFileState
> = (set, get) => ({
  uploadedFile: null,
  setUploadedFile: (uploadedFile) => {
    set({ uploadedFile });
    get().setHref(uploadedFile.name);
  },
});
