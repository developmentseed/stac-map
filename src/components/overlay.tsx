import { LuUpload } from "react-icons/lu";
import {
  Button,
  FileUpload,
  GridItem,
  HStack,
  IconButton,
  SimpleGrid,
} from "@chakra-ui/react";
import { Examples } from "./examples";
import HrefInput from "./href-input";
import Panel from "./panel";
import { ColorModeButton } from "./ui/color-mode";
import { useStore } from "../store";

export default function Overlay() {
  const setUploadedFile = useStore((store) => store.setUploadedFile);

  return (
    <SimpleGrid columns={3} gap={4}>
      <GridItem colSpan={1}>
        <Panel />
      </GridItem>
      <GridItem colSpan={2}>
        <HStack pointerEvents={"auto"}>
          <HrefInput />
          <FileUpload.Root
            flex={0}
            onFileAccept={(details) => setUploadedFile(details.files[0])}
          >
            <FileUpload.HiddenInput />
            <FileUpload.Trigger asChild>
              <IconButton bg={"bg.muted/90"} variant={"outline"}>
                <LuUpload />
              </IconButton>
            </FileUpload.Trigger>
          </FileUpload.Root>
          <Examples>
            <Button bg={"bg.muted/90"} variant={"outline"}>
              Examples
            </Button>
          </Examples>
          <ColorModeButton variant={"surface"} />
        </HStack>
      </GridItem>
    </SimpleGrid>
  );
}
