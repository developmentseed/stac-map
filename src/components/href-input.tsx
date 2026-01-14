import { Box, Input } from "@chakra-ui/react";
import { useStore } from "../store";

export default function HrefInput() {
  const setHref = useStore((state) => state.setHref);
  const input = useStore((state) => state.input);
  const setInput = useStore((state) => state.setInput);

  return (
    <Box
      as={"form"}
      onSubmit={(e) => {
        e.preventDefault();
        setHref(input || null);
      }}
      flex="1"
    >
      <Input
        bg={"bg.muted/90"}
        placeholder="Enter a url to a STAC API, JSON, or GeoParquet"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></Input>
    </Box>
  );
}
