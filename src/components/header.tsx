import { Box, Button, ButtonGroup, HStack, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Examples } from "../examples";
import useStacMap from "../hooks/stac-map";
import { ColorModeButton } from "./ui/color-mode";
import Upload from "./upload";

export default function Header() {
  return (
    <HStack pointerEvents={"auto"}>
      <HrefInput></HrefInput>
      <ButtonGroup variant={"subtle"}>
        <Upload></Upload>
        <Examples>
          <Button>Examples</Button>
        </Examples>
        <ColorModeButton></ColorModeButton>
      </ButtonGroup>
    </HStack>
  );
}

function HrefInput() {
  const { href, setHref } = useStacMap();
  const [value, setValue] = useState(href || "");

  useEffect(() => {
    if (href) {
      setValue(href);
    }
  }, [href]);

  return (
    <Box
      as={"form"}
      onSubmit={(e) => {
        e.preventDefault();
        setHref(value);
      }}
      w={"full"}
    >
      <Input
        bg={"bg.muted/90"}
        placeholder="Enter a STAC JSON or GeoParquet url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      ></Input>
    </Box>
  );
}
