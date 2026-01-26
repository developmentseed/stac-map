import {
  LuFile,
  LuFileQuestion,
  LuFiles,
  LuFolder,
  LuFolderPlus,
} from "react-icons/lu";
import type { StacValue } from "../../types/stac";

export function StacIcon({ value }: { value: StacValue }) {
  switch (value.type) {
    case "Collection":
      return <LuFolderPlus />;
    case "Feature":
      return <LuFile />;
    case "Catalog":
      return <LuFolder />;
    case "FeatureCollection":
      return <LuFiles />;
    default:
      return <LuFileQuestion />;
  }
}
