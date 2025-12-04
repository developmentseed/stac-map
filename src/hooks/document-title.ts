import { useEffect } from "react";
import type { StacValue } from "../types/stac";

export default function useDocumentTitle(value: StacValue | undefined) {
  useEffect(() => {
    if (value && (value.title || value.id)) {
      document.title = "stac-map | " + (value.title || value.id);
    } else {
      document.title = "stac-map";
    }
  }, [value]);
}
