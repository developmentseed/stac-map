import { FileUpload, IconButton } from "@chakra-ui/react";
import { LuUpload } from "react-icons/lu";
import useStacMap from "../hooks/stac-map";

export default function Upload() {
  const { fileUpload } = useStacMap();

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
