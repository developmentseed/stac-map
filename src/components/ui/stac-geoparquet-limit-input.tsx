import { useStore } from "@/store";
import { Button, HStack, NumberInput } from "@chakra-ui/react";
import { useState } from "react";

/**
 * Input for the maximum number of stac-geoparquet items to load. Changes are
 * only applied on submit to avoid re-querying on every keystroke.
 */
export function StacGeoparquetLimitInput() {
  const limit = useStore((store) => store.stacGeoparquetLimit);
  return <LimitForm key={limit} limit={limit} />;
}

function LimitForm({ limit }: { limit: number }) {
  const setLimit = useStore((store) => store.setStacGeoparquetLimit);
  const [value, setValue] = useState(limit);
  const isValid = Number.isInteger(value) && value > 0;
  const canApply = isValid && value !== limit;

  return (
    <HStack
      as="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (canApply) setLimit(value);
      }}
    >
      <NumberInput.Root
        size={"sm"}
        min={1}
        step={1000}
        value={Number.isNaN(value) ? "" : String(value)}
        onValueChange={(e) => setValue(e.valueAsNumber)}
        invalid={!isValid}
        maxW={"40"}
      >
        <NumberInput.Control />
        <NumberInput.Input aria-label="stac-geoparquet item limit" />
      </NumberInput.Root>
      <Button
        size={"sm"}
        variant={"outline"}
        type="submit"
        disabled={!canApply}
      >
        Apply
      </Button>
    </HStack>
  );
}
