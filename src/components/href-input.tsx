import {
  Box,
  FileUpload,
  IconButton,
  Input,
  InputGroup,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuUpload } from "react-icons/lu";
import { useStacGeoparquet } from "../contexts/stac-geoparquet";
import { useStore } from "../store";
import { uploadFile } from "../utils/upload";

export default function HrefInput() {
  const href = useStore((store) => store.href);
  const setHref = useStore((state) => state.setHref);
  const setUploadedFile = useStore((store) => store.setUploadedFile);
  const parquetCtx = useStacGeoparquet();
  const [input, setInput] = useState(href || "");
  const [lastHref, setLastHref] = useState(href);

  if (href !== lastHref) {
    setLastHref(href);
    setInput(href || "");
  }

  const placeholder = parquetCtx
    ? "Enter a url to a STAC API, JSON, or GeoParquet"
    : "Enter a url to a STAC API or JSON";

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
              void uploadFile({
                file: details.files[0],
                setUploadedFile,
                registerParquet: parquetCtx?.registerParquet,
              })
            }
          >
            <FileUpload.HiddenInput />
            <FileUpload.Trigger asChild>
              <IconButton variant={"plain"} size={"sm"}>
                <LuUpload />
              </IconButton>
            </FileUpload.Trigger>
          </FileUpload.Root>
        }
      >
        <Input
          bg={"bg.muted/90"}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </InputGroup>
    </Box>
  );
}
