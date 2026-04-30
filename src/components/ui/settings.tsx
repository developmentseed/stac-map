import type { IconButtonProps } from "@chakra-ui/react";
import {
  Box,
  CloseButton,
  Dialog,
  Field,
  Flex,
  HStack,
  IconButton,
  Input,
  Portal,
  Separator,
  Switch,
  Text,
} from "@chakra-ui/react";
import * as React from "react";
import { LuPlus, LuSettings, LuTrash2 } from "react-icons/lu";
import { useAuthEnabled } from "../../contexts/auth-enabled";
import { useStore } from "../../store";

interface SettingsButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const SettingsButton = React.forwardRef<
  HTMLButtonElement,
  SettingsButtonProps
>(function SettingsButton(props, ref) {
  const authEnabled = useAuthEnabled();
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
              {!authEnabled && (
                <>
                  <Separator my={4} />
                  <TokensSection />
                </>
              )}
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

function TokensSection() {
  const tokens = useStore((store) => store.tokens);
  const setToken = useStore((store) => store.setToken);
  const removeToken = useStore((store) => store.removeToken);
  const href = useStore((store) => store.href);

  const defaultBaseUri = React.useMemo(() => {
    if (!href) return "";
    try {
      return new URL(href).origin;
    } catch {
      return "";
    }
  }, [href]);

  const [baseUri, setBaseUri] = React.useState("");
  const [tokenValue, setTokenValue] = React.useState("");

  const handleAdd = () => {
    const uri = baseUri.trim() || defaultBaseUri;
    const val = tokenValue.trim();
    if (!uri || !val) return;
    setToken(uri, val);
    setBaseUri("");
    setTokenValue("");
  };

  const entries = Object.entries(tokens);

  return (
    <Box>
      <Text fontWeight="medium" mb={2}>
        Access tokens
      </Text>
      <Text fontSize="sm" color="fg.muted" mb={3}>
        Provide Bearer tokens for authenticated STAC APIs.
      </Text>
      {entries.length > 0 && (
        <Box mb={3}>
          {entries.map(([uri]) => (
            <Flex key={uri} align="center" justify="space-between" py={1}>
              <Text fontSize="sm" truncate>
                {uri}
              </Text>
              <IconButton
                aria-label={`Remove token for ${uri}`}
                size="xs"
                variant="ghost"
                onClick={() => removeToken(uri)}
              >
                <LuTrash2 />
              </IconButton>
            </Flex>
          ))}
        </Box>
      )}
      <HStack>
        <Input
          placeholder={defaultBaseUri || "https://api.example.com"}
          size="sm"
          value={baseUri}
          onChange={(e) => setBaseUri(e.target.value)}
        />
        <Input
          placeholder="Token"
          size="sm"
          type="password"
          value={tokenValue}
          onChange={(e) => setTokenValue(e.target.value)}
        />
        <IconButton
          aria-label="Add token"
          size="sm"
          variant="outline"
          onClick={handleAdd}
        >
          <LuPlus />
        </IconButton>
      </HStack>
    </Box>
  );
}
