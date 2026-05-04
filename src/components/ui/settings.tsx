import {
  Box,
  Checkbox,
  CloseButton,
  Dialog,
  Fieldset,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Portal,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LuPlus, LuSettings, LuTrash2 } from "react-icons/lu";
import { useStore } from "../../store";

export function SettingsButton() {
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  const setHivePartitioning = useStore((store) => store.setHivePartitioning);
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
              <Stack gap={4}>
                <Fieldset.Root size={"sm"}>
                  <Fieldset.Content gap={2}>
                    <Checkbox.Root
                      checked={hivePartitioning}
                      onCheckedChange={(e) => setHivePartitioning(!!e.checked)}
                      alignItems={"flex-start"}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Stack>
                        <Checkbox.Label>
                          Use hive partitioning for stac-geoparquet queries
                        </Checkbox.Label>
                      </Stack>
                    </Checkbox.Root>
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
                          Listen for errors in upstream libraries and display
                          them as toasts. Can be noisy.
                        </Box>
                      </Stack>
                    </Checkbox.Root>
                  </Fieldset.Content>
                </Fieldset.Root>
                <Separator />
                <Tokens />
              </Stack>
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

function Tokens() {
  const tokens = useStore((store) => store.tokens);
  const setToken = useStore((store) => store.setToken);
  const removeToken = useStore((store) => store.removeToken);
  const href = useStore((store) => store.href);
  const queryClient = useQueryClient();

  const defaultBaseUri = useMemo(() => {
    if (!href) return "";
    try {
      return new URL(href).origin;
    } catch {
      return "";
    }
  }, [href]);

  const refetchHref = () => {
    queryClient.invalidateQueries({ refetchType: "all" });
  };

  const [baseUri, setBaseUri] = useState("");
  const [tokenValue, setTokenValue] = useState("");

  const handleAdd = () => {
    const uri = baseUri ? new URL(baseUri).origin : defaultBaseUri;
    const val = tokenValue.trim();
    if (!uri || !val) return;
    setToken(uri, val);
    setBaseUri("");
    setTokenValue("");
    refetchHref();
  };

  const handleRemove = (uri: string) => {
    removeToken(uri);
    refetchHref();
  };

  const entries = Object.entries(tokens);

  return (
    <Stack>
      <Heading size={"md"}>Access tokens</Heading>
      <Text fontSize="sm" color="fg.muted">
        Provide Bearer tokens for auth-enabled STAC APIs
      </Text>
      <Stack>
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

        {entries.length > 0 &&
          entries.map(([uri]) => (
            <Flex key={uri} align="center" justify="space-between">
              <Text fontSize="sm" truncate>
                {uri}
              </Text>
              <IconButton
                aria-label={`Remove token for ${uri}`}
                size="xs"
                variant="ghost"
                onClick={() => handleRemove(uri)}
              >
                <LuTrash2 />
              </IconButton>
            </Flex>
          ))}
      </Stack>
    </Stack>
  );
}
