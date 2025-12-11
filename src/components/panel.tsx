import {
  Alert,
  SkeletonText,
  type UseFileUploadReturn,
} from "@chakra-ui/react";
import Introduction from "./introduction";
import { type SharedValueProps, Value } from "./value";
import type { StacValue } from "../types/stac";

export interface PanelProps extends SharedValueProps {
  href: string | undefined;
  value: StacValue | undefined;
  error: Error | undefined;
  fileUpload: UseFileUploadReturn;
}

export default function Panel({
  href,
  setHref,
  value,
  error,
  fileUpload,
  ...props
}: PanelProps) {
  if (error)
    return (
      <Alert.Root status={"error"}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Error while fetching STAC value</Alert.Title>
          <Alert.Description>{error.toString()}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  else if (href) {
    if (value) {
      return (
        <Value
          key={href}
          href={href}
          value={value}
          setHref={setHref}
          {...props}
        />
      );
    } else {
      return <SkeletonText />;
    }
  } else {
    return <Introduction setHref={setHref} fileUpload={fileUpload} />;
  }
}
