import { CloseButton, IconButton } from "@chakra-ui/react";
import { LuArrowRight } from "react-icons/lu";
import type { StacItem } from "stac-ts";

import { useStore } from "../../store";
import { getSelfHref, getStacValueId } from "../../utils/stac";
import { StacIcon } from "../ui/stac";
import Value from "../value";
import { BasePanel, PanelHeader } from "./base";

export function PickedItemPanel({ pickedItem }: { pickedItem: StacItem }) {
  const setHref = useStore((store) => store.setHref);
  const clearPickedItem = useStore((store) => store.clearPickedItem);
  const href = getSelfHref(pickedItem);

  const header = (
    <PanelHeader
      icon={<StacIcon value={pickedItem} />}
      actions={
        <>
          {href && (
            <IconButton
              variant="subtle"
              size="2xs"
              onClick={() => setHref(href)}
            >
              <LuArrowRight />
            </IconButton>
          )}
          <CloseButton size="2xs" onClick={() => clearPickedItem()} />
        </>
      }
    >
      {getStacValueId(pickedItem)}
    </PanelHeader>
  );
  return (
    <BasePanel header={header}>
      <Value value={pickedItem} />
    </BasePanel>
  );
}
