import {
  Box,
  Button,
  ButtonGroup,
  FileUpload,
  HStack,
  IconButton,
  Input,
  type UseFileUploadReturn,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuUpload } from "react-icons/lu";
import { Examples } from "../examples";
import type { SetHref } from "../types/app";
import About from "./about";
import { ColorModeButton } from "./ui/color-mode";

export default function Header({
  href,
  setHref,
  fileUpload,
}: {
  href: string | undefined;
  setHref: SetHref;
  fileUpload: UseFileUploadReturn;
}) {
  const [value, setValue] = useState(href || "");

  useEffect(() => {
    if (href) {
      setValue(href);
    }
  }, [href]);

  return (
    <HStack pointerEvents={"auto"}>
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
      <ButtonGroup variant={"subtle"}>
        <Upload fileUpload={fileUpload}></Upload>
        <Examples setHref={setHref}>
          <Button>Examples</Button>
        </Examples>
        <About></About>
        <ColorModeButton></ColorModeButton>
      </ButtonGroup>
    </HStack>
  );
}

function Upload({ fileUpload }: { fileUpload: UseFileUploadReturn }) {
  return (
    <FileUpload.RootProvider value={fileUpload}>
      <FileUpload.HiddenInput />
      <FileUpload.Trigger asChild>
        <IconButton>
          <LuUpload />
        </IconButton>
      </FileUpload.Trigger>
    </FileUpload.RootProvider>
  );
}
