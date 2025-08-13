import type { StacItem } from "stac-ts";
import Assets from "./assets";

export default function Item({ item }: { item: StacItem }) {
  return <Assets assets={item.assets}></Assets>;
}
