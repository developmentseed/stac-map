import type { StacValue } from "../types/stac";

export default function setDocumentTitle(value: StacValue | undefined) {
  let title = "stac-map";
  if (value && (value.title || value.id)) {
    title = "stac-map | " + (value.title || value.id);
  }
  return title;
}
