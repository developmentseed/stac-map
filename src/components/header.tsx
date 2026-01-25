import { Button, FileUpload, HStack, IconButton } from "@chakra-ui/react";
import { useDuckDb } from "duckdb-wasm-kit";
import { LuUpload } from "react-icons/lu";
import { useStore } from "../store";
import { uploadFile } from "../utils/upload";
import { Examples } from "./examples";
import HrefInput from "./href-input";
import { ColorModeButton } from "./ui/color-mode";

export default function Header() {
  const setUploadedFile = useStore((store) => store.setUploadedFile);
  const { db } = useDuckDb();

  return (
    <HStack pointerEvents={"auto"}>
      <HrefInput />
      <FileUpload.Root
        flex={0}
        onFileAccept={(details) =>
          uploadFile({
            file: details.files[0],
            setUploadedFile,
            db,
          })
        }
      >
        <FileUpload.HiddenInput />
        <FileUpload.Trigger asChild>
          <IconButton bg={"bg.muted/90"} variant={"outline"} disabled={!db}>
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
  );
}
