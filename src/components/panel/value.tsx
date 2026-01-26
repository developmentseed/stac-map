import type { StacValue } from "../../types/stac";
import { getStacValueId } from "../../utils/stac";
import { StacIcon } from "../ui/stac";
import Value from "../value";
import { BasePanel, PanelHeader } from "./base";

export function ValuePanel({ value }: { value: StacValue }) {
  const header = (
    <PanelHeader icon={<StacIcon value={value} />}>
      {getStacValueId(value)}
    </PanelHeader>
  );
  return (
    <BasePanel header={header}>
      <Value value={value} />
    </BasePanel>
  );
}
