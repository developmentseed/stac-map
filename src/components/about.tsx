import {
  CloseButton,
  DataList,
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
              <Stack gap={8}>
                <Text>
                  <strong>stac-map</strong> was created and is maintained by{" "}
                  <Link href="https://developmentseed.org" target="_blank">
                    Development Seed <LuExternalLink></LuExternalLink>
                  </Link>
                  , and it is public and free for modification and re-use under
                  the{" "}
                  <Link
                    href="https://opensource.org/license/mit"
                    target="_blank"
                  >
                    MIT license <LuExternalLink></LuExternalLink>
                  </Link>
                  .
                </Text>
                <DataList.Root>
                  {import.meta.env.VITE_APP_VERSION && (
                    <DataList.Item>
                      <DataList.ItemLabel>App version</DataList.ItemLabel>
                      <DataList.ItemValue>
                        {import.meta.env.VITE_APP_VERSION}
                      </DataList.ItemValue>
                    </DataList.Item>
                  )}
                  {import.meta.env.VITE_APP_DEPLOY_DATETIME && (
                    <DataList.Item>
                      <DataList.ItemLabel>Deployed at</DataList.ItemLabel>
                      <DataList.ItemValue>
                        {import.meta.env.VITE_APP_DEPLOY_DATETIME}
                      </DataList.ItemValue>
                    </DataList.Item>
                  )}
                </DataList.Root>
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
