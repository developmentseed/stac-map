import { useEffect, useState } from "react";
import { LuUpload } from "react-icons/lu";
import {
  Box,
  Button,
  FileUpload,
  GridItem,
  HStack,
  IconButton,
  Input,
  SimpleGrid,
} from "@chakra-ui/react";
import Breadcrumbs from "./breadcrumbs";
import { Examples } from "./examples";
import Panel, { type PanelProps } from "./panel";
import { ColorModeButton } from "./ui/color-mode";
import type { StacValue } from "../types/stac";

export interface OverlayProps extends PanelProps {
  picked: StacValue | undefined;
  setPicked: (picked: StacValue | undefined) => void;
}

export default function Overlay({
  href,
  setHref,
  fileUpload,
  value,
  picked,
  setPicked,
  items,
  filteredItems,
  ...props
}: OverlayProps) {
  return (
    <SimpleGrid columns={3} gap={4}>
      <GridItem colSpan={1}>
        <Box
          bg={"bg.muted"}
          pointerEvents={"auto"}
          rounded={4}
          borderColor={"bg.emphasized"}
        >
          <Box
            borderBottomWidth={1}
            borderColor={"border.subtle"}
            py={2}
            px={4}
          >
            {(value && (
              <Breadcrumbs
                value={value}
                picked={picked}
                setPicked={setPicked}
                setHref={setHref}
              />
            )) || <HStack fontWeight={"light"}>stac-map</HStack>}
          </Box>
          <Box p={4} overflow={"scroll"} maxH={"80dvh"}>
            <Panel
              href={href}
              setHref={setHref}
              value={picked || value}
              fileUpload={fileUpload}
              items={picked ? undefined : items}
              filteredItems={picked ? undefined : filteredItems}
              {...props}
            />
          </Box>
        </Box>
      </GridItem>
      <GridItem colSpan={2}>
        <HStack pointerEvents={"auto"}>
          <HrefInput href={href} setHref={setHref} />
          <Examples setHref={setHref}>
            <Button bg={"bg.muted/90"} variant={"outline"}>
              Examples
            </Button>
          </Examples>
          <FileUpload.RootProvider value={fileUpload} flex={"0"}>
            <FileUpload.HiddenInput />
            <FileUpload.Trigger asChild>
              <IconButton variant={"surface"} aria-label="upload">
                <LuUpload />
              </IconButton>
            </FileUpload.Trigger>
          </FileUpload.RootProvider>
          <ColorModeButton variant={"surface"} />
        </HStack>
      </GridItem>
    </SimpleGrid>
  );
}

function HrefInput({
  href,
  setHref,
}: {
  href: string | undefined;
  setHref: (href: string | undefined) => void;
}) {
  const [value, setValue] = useState<string | undefined>(href || "");

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
      flex="1"
    >
      <Input
        bg={"bg.muted/90"}
        placeholder="Enter a url to STAC JSON or GeoParquet"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      ></Input>
    </Box>
  );
}
