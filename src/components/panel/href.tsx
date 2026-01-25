import { Alert } from "@chakra-ui/react";
import { useEffect } from "react";
import { LuFileWarning } from "react-icons/lu";

import { useStacJson, useStacJsonFromFile } from "../../hooks/stac";
import { useStore } from "../../store";
import { BasePanel, PanelHeader } from "./base";
import { LoadingPanel } from "./loading";

export function HrefPanel({ href }: { href: string }) {
  const setValue = useStore((store) => store.setValue);
  const result = useStacJson({ href });

  useEffect(() => {
    if (result.data) setValue(result.data);
  }, [result.data, setValue]);

  return <LoadingPanel href={href} {...result} />;
}

export function LocalHrefPanel({ href }: { href: string }) {
  const uploadedFile = useStore((store) => store.uploadedFile);

  return uploadedFile ? (
    <LocalFilePanel file={uploadedFile} />
  ) : (
    <BasePanel
      header={
        <PanelHeader icon={<LuFileWarning />}>
          Could not load {href}
        </PanelHeader>
      }
    >
      <Alert.Root status={"error"}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>
            {href} is a local file path, but no file was uploaded
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </BasePanel>
  );
}

export function LocalFilePanel({ file }: { file: File }) {
  const setValue = useStore((store) => store.setValue);
  const result = useStacJsonFromFile({ file });

  useEffect(() => {
    if (result.data) setValue(result.data);
  }, [result.data, setValue]);

  return <LoadingPanel href={file.name} {...result} />;
}
