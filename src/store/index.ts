import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type AssetsState, createAssetsSlice } from "./assets";
import { type BboxState, createBboxSlice } from "./bbox";
import { type CatalogsState, createCatalogsSlice } from "./catalogs";
import { type CogsState, createCogsSlice } from "./cogs";
import { type CollectionsState, createCollectionsSlice } from "./collections";
import { type ConnectionState, createConnectionSlice } from "./connection";
import { createDatetimeSlice, type DatetimeState } from "./datetime";
import { createHrefSlice, type HrefState } from "./href";
import { createInputSlice, type InputState } from "./input";
import { createItemsSlice, type ItemsState } from "./items";
import { createMapSlice, type MapState } from "./map";
import { createSettingsSlice, type SettingsState } from "./settings";
import {
  createStacGeoparquetState,
  type StacGeoparquetState,
} from "./stac-geoparquet";
import {
  createUploadedFileSlice,
  type UploadedFileState,
} from "./uploaded-file";
import { createValueSlice, type ValueState } from "./value";
import { createWebMapLinksSlice, type WebMapLinksState } from "./web-map-links";

export interface State
  extends
    CatalogsState,
    CogsState,
    CollectionsState,
    ItemsState,
    HrefState,
    InputState,
    ValueState,
    AssetsState,
    BboxState,
    UploadedFileState,
    ConnectionState,
    DatetimeState,
    MapState,
    SettingsState,
    StacGeoparquetState,
    WebMapLinksState {
  fillColor: [number, number, number, number];
  lineColor: [number, number, number, number];
  lineWidth: number;
}

export const useStore = create<State>()(
  persist(
    (...a) => ({
      ...createHrefSlice(...a),
      ...createInputSlice(...a),
      ...createValueSlice(...a),
      ...createCollectionsSlice(...a),
      ...createCogsSlice(...a),
      ...createItemsSlice(...a),
      ...createAssetsSlice(...a),
      ...createBboxSlice(...a),
      ...createUploadedFileSlice(...a),
      ...createConnectionSlice(...a),
      ...createStacGeoparquetState(...a),
      ...createCatalogsSlice(...a),
      ...createDatetimeSlice(...a),
      ...createMapSlice(...a),
      ...createSettingsSlice(...a),
      ...createWebMapLinksSlice(...a),
      fillColor: [207, 63, 2, 50] as [number, number, number, number],
      lineColor: [207, 63, 2, 100] as [number, number, number, number],
      lineWidth: 2,
    }),
    {
      name: "stac-map-settings",
      partialize: (state) => ({
        restrictToThreeBandCogs: state.restrictToThreeBandCogs,
        hivePartitioning: state.hivePartitioning,
      }),
    }
  )
);
