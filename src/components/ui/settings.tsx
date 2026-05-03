import {
  Box,
  Checkbox,
  CloseButton,
  Dialog,
  Fieldset,
  IconButton,
  Portal,
  Stack,
} from "@chakra-ui/react";
import { LuSettings } from "react-icons/lu";
import { useStore } from "../../store";

export function SettingsButton() {
  const addErrorListener = useStore((store) => store.addErrorListener);
  const setAddErrorListener = useStore((store) => store.setAddErrorListener);

  return (
    <Dialog.Root size={"lg"}>
      <Dialog.Trigger asChild>
        <IconButton aria-label="Settings">
          <LuSettings />
        </IconButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Settings</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Fieldset.Root size={"sm"}>
                <Fieldset.Content>
                  <Checkbox.Root
                    checked={addErrorListener}
                    onCheckedChange={(e) => setAddErrorListener(!!e.checked)}
                    alignItems={"flex-start"}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Stack>
                      <Checkbox.Label>Add error listener</Checkbox.Label>
                      <Box textStyle={"sm"} color={"fg.muted"}>
                        Listen for errors in upstream libraries and display them
                        as toasts. Can be noisy.
                      </Box>
                    </Stack>
                  </Checkbox.Root>
                </Fieldset.Content>
              </Fieldset.Root>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size={"sm"} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
