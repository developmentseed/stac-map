import type { State } from ".";
import type { StateCreator } from "zustand";

export interface UploadedFileState {
  uploadedFile: File | null;
  setUploadedFile: (uploadedFile: File) => void;
}

export const createUploadedFileSlice: StateCreator<
  State,
  [],
  [],
  UploadedFileState
> = (set) => ({
  uploadedFile: null,
  setUploadedFile: (uploadedFile) =>
    set({ uploadedFile, href: uploadedFile.name }),
});
