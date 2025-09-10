import {
  CloseButton,
  Dialog,
  IconButton,
  Link,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuExternalLink, LuInfo } from "react-icons/lu";

export default function About() {
  return (
    <Dialog.Root trapFocus={false}>
      <Dialog.Trigger asChild>
        <IconButton>
          <LuInfo></LuInfo>
        </IconButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop></Dialog.Backdrop>
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>About</Dialog.Header>
            <Dialog.Body>
              <Stack>
                <Text>
                  <strong>stac-map</strong> was created and is maintained by{" "}
                  <Link href="https://developmentseed.org">
                    Development Seed <LuExternalLink></LuExternalLink>
                  </Link>
                  . It is public and free for modification and re-use under the{" "}
                  <Link href="https://opensource.org/license/mit">
                    MIT license <LuExternalLink></LuExternalLink>
                  </Link>
                  .
                </Text>
                <Text>
                  This is version{" "}
                  <code>{import.meta.env.VITE_APP_VERSION}</code> of{" "}
                  <strong>stac-map</strong>. It was deployed on{" "}
                  {import.meta.env.VITE_APP_DEPLOY_DATETIME}.
                </Text>
              </Stack>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
