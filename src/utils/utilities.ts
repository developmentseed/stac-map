import type { StacValue } from "../types/stac";

// @NOTE-SANDRA: Turn this into a simple function instead
// the useEffect isn't really needed at this level because only app.tsx needs to subscribe to it
export default function setDocumentTitle(value: StacValue | undefined) {
  let title = "stac-map";
  if (value && (value.title || value.id)) {
    title = "stac-map | " + (value.title || value.id);
  }
  return title;
}
