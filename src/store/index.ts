import { create } from "zustand";
import { type BboxState, createBboxSlice } from "./bbox";
import { type CatalogsState, createCatalogsSlice } from "./catalogs";
import { type CollectionsState, createCollectionsSlice } from "./collections";
import { type ConnectionState, createConnectionSlice } from "./connection";
import { createGeotiffSlice, type GeotiffState } from "./geotiff";
import { createHoversSlice, type HoverState } from "./hover";
import { createHrefSlice, type HrefState } from "./href";
import { createInputSlice, type InputState } from "./input";
import { createItemsSlice, type ItemsState } from "./items";
import {
  createStacGeoparquetState,
  type StacGeoparquetState,
} from "./stac-geoparquet";
import {
  createUploadedFileSlice,
  type UploadedFileState,
} from "./uploaded-file";
import { createValueSlice, type ValueState } from "./value";

export interface State
  extends
    CatalogsState,
    CollectionsState,
    ItemsState,
    HoverState,
    HrefState,
    InputState,
    ValueState,
    GeotiffState,
    BboxState,
    UploadedFileState,
    ConnectionState,
    StacGeoparquetState {
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
  ...createUploadedFileSlice(...a),
  ...createConnectionSlice(...a),
  ...createStacGeoparquetState(...a),
  ...createCatalogsSlice(...a),
  fillColor: [207, 63, 2, 50] as [number, number, number, number],
  lineColor: [207, 63, 2, 100] as [number, number, number, number],
  lineWidth: 2,
}));
