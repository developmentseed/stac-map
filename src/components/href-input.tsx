import {
  Box,
  FileUpload,
  IconButton,
  Input,
  InputGroup,
} from "@chakra-ui/react";
import { useDuckDb } from "duckdb-wasm-kit";
import { LuUpload } from "react-icons/lu";
import { useStore } from "../store";
import { uploadFile } from "../utils/upload";

export default function HrefInput() {
  const setHref = useStore((state) => state.setHref);
  const input = useStore((state) => state.input);
  const setInput = useStore((state) => state.setInput);
  const setUploadedFile = useStore((store) => store.setUploadedFile);
  const { db } = useDuckDb();

  return (
    <Box
      as={"form"}
      onSubmit={(e) => {
        e.preventDefault();
        setHref(input || null);
      }}
      flex="1"
    >
      <InputGroup
        endElement={
          <FileUpload.Root
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
              <IconButton variant={"plain"} size={"sm"} disabled={!db}>
                <LuUpload />
              </IconButton>
            </FileUpload.Trigger>
          </FileUpload.Root>
        }
      >
        <Input
          bg={"bg.muted/90"}
          placeholder="Enter a url to a STAC API, JSON, or GeoParquet"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </InputGroup>
    </Box>
  );
}
