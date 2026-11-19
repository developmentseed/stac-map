import { type BBox2D, type Color, useStore } from "@/store";
import { GeoJsonLayer } from "@deck.gl/layers";
import bboxPolygon from "@turf/bbox-polygon";
import { useEffect } from "react";

/**
 * Draws the outline of a bbox on the map, in the inverse of the line color.
 */
export function BboxLayer({ id, bbox }: { id: string; bbox: BBox2D }) {
  const setLayer = useStore((store) => store.setLayer);
  const lineColor = useStore((store) => store.lineColor);

  useEffect(() => {
    const inverted: Color = [
      255 - lineColor[0],
      255 - lineColor[1],
      255 - lineColor[2],
      lineColor[3],
    ];
    setLayer(
      id,
      new GeoJsonLayer({
        id,
        data: [bboxPolygon(bbox)],
        filled: false,
        getLineColor: inverted,
        getLineWidth: 2,
        lineWidthUnits: "pixels",
      })
    );
    return () => setLayer(id, undefined);
  }, [id, bbox, lineColor, setLayer]);

  return null;
}
