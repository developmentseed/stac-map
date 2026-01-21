import { create } from "zustand";
import { type BboxState, createBboxSlice } from "./bbox";
import { type CollectionsState, createCollectionsSlice } from "./collections";
import { createGeotiffSlice, type GeotiffState } from "./geotiff";
import { createHoversSlice, type HoverState } from "./hover";
import { createHrefSlice, type HrefState } from "./href";
import { createInputSlice, type InputState } from "./input";
import { createItemsSlice, type ItemsState } from "./items";
import { createValueSlice, type ValueState } from "./value";

export interface State
  extends
    CollectionsState,
    ItemsState,
    HoverState,
    HrefState,
    InputState,
    ValueState,
    GeotiffState,
    BboxState {
  fillColor: [number, number, number, number];
  lineColor: [number, number, number, number];
  lineWidth: number;
}

export const useStore = create<State>((...a) => ({
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
