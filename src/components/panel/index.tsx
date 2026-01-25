import { useStore } from "../../store";
import { isUrl } from "../../utils/href";
import Introduction from "../introduction";
import { BasePanel } from "./base";
import { HrefPanel, LocalHrefPanel } from "./href";
import { PickedItemPanel } from "./picked-item";
import { StacGeoparquetHrefPanel } from "./stac-geoparquet";
import { ValuePanel } from "./value";

export default function Panel() {
  const href = useStore((store) => store.href);
  const hrefIsParquet = useStore((store) => store.hrefIsParquet);
  const value = useStore((store) => store.value);
  const pickedItem = useStore((store) => store.pickedItem);

  if (pickedItem) {
    return <PickedItemPanel pickedItem={pickedItem} />;
  } else if (value) {
    return <ValuePanel value={value} />;
  } else if (href) {
    const hrefIsUrl = isUrl(href);
    return hrefIsParquet ? (
      <StacGeoparquetHrefPanel href={href} />
    ) : hrefIsUrl ? (
      <HrefPanel href={href} />
    ) : (
      <LocalHrefPanel href={href} />
    );
  } else {
    return (
      <BasePanel header="stac-map">
        <Introduction />
      </BasePanel>
    );
  }
}
