import { create } from "zustand";
import { createCollectionsSlice, type CollectionsState } from "./collections";
import { createItemsSlice, type ItemsState } from "./items";
import { createHoversSlice, type HoverState } from "./hover";
import { createHrefSlice, type HrefState } from "./href";
import { createInputSlice, type InputState } from "./input";
import { createGeotiffSlice, type GeotiffState } from "./geotiff";
import { createValueSlice, type ValueState } from "./value";
import { createBboxSlice, type BboxState } from "./bbox";

interface State extends CollectionsState, ItemsState, HoverState, HrefState, InputState, ValueState, GeotiffState, BboxState {
  fillColor: [number, number, number, number];
  lineColor: [number, number, number, number];
  lineWidth: number;
};

export const useBoundStore = create<State>((...a) => ({
  ...createHrefSlice(...a),
  ...createInputSlice(...a),
  ...createValueSlice(...a),
  ...createCollectionsSlice(...a),
  ...createItemsSlice(...a),
  ...createHoversSlice(...a),
  ...createGeotiffSlice(...a),
  ...createBboxSlice(...a),
  fillColor: [207, 63, 2, 50] as [number, number, number, number],
  lineColor: [207, 63, 2, 100] as [number, number, number, number],
  lineWidth: 2,
}));