import { AbsoluteCenter, Alert, Box, Button, Stack } from "@chakra-ui/react";

export function ErrorComponent({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <Box position={"absolute"} top={"0"} left={"0"} h={"100dvh"} w={"100dvw"}>
      <AbsoluteCenter>
        <Alert.Root status={"error"}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Unhandled application error</Alert.Title>
            <Alert.Description>
              <Stack>
                <Box>{error.message}</Box>
                <Button
                  variant={"surface"}
                  onClick={() => resetErrorBoundary()}
                >
                  Reset
                </Button>
              </Stack>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </AbsoluteCenter>
    </Box>
  );
}
