import type { IconButtonProps } from "@chakra-ui/react";
import {
  CloseButton,
  Dialog,
  Field,
  IconButton,
  Portal,
  Switch,
  Text,
} from "@chakra-ui/react";
import * as React from "react";
import { LuSettings } from "react-icons/lu";
import { useStore } from "../../store";

interface SettingsButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const SettingsButton = React.forwardRef<
  HTMLButtonElement,
  SettingsButtonProps
>(function SettingsButton(props, ref) {
  const restrictToThreeBandCogs = useStore(
    (store) => store.restrictToThreeBandCogs
  );
  const setRestrictToThreeBandCogs = useStore(
    (store) => store.setRestrictToThreeBandCogs
  );
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  const setHivePartitioning = useStore((store) => store.setHivePartitioning);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <IconButton variant="ghost" aria-label="Settings" ref={ref} {...props}>
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
              <Field.Root>
                <Switch.Root
                  checked={restrictToThreeBandCogs}
                  onCheckedChange={(e) => setRestrictToThreeBandCogs(e.checked)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Label>Restrict to 3-band COGs</Switch.Label>
                </Switch.Root>
                <Field.HelperText>
                  <Text fontSize="sm" color="fg.muted">
                    When enabled, only COGs with three bands can be visualized.
                    Disable to allow COGs with any number of bands or no bands
                    in their STAC metadata.
                  </Text>
                </Field.HelperText>
              </Field.Root>
              <Field.Root mt={4}>
                <Switch.Root
                  checked={hivePartitioning}
                  onCheckedChange={(e) => setHivePartitioning(e.checked)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Label>Hive partitioning</Switch.Label>
                </Switch.Root>
                <Field.HelperText>
                  <Text fontSize="sm" color="fg.muted">
                    When enabled, DuckDB will interpret path segments as
                    partitions when reading stac-geoparquet files.
                  </Text>
                </Field.HelperText>
              </Field.Root>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});
