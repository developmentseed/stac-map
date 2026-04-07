import type { IconButtonProps } from "@chakra-ui/react";
import {
  AbsoluteCenter,
  Button,
  CloseButton,
  Dialog,
  Heading,
  HStack,
  IconButton,
  Portal,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import * as React from "react";
import { LuLock, LuUser } from "react-icons/lu";
import { useAuth } from "react-oidc-context";

const authority = import.meta.env.VITE_AUTH_AUTHORITY as string | undefined;
const clientId = import.meta.env.VITE_AUTH_CLIENT_ID as string | undefined;

export const authConfig =
  authority && clientId
    ? {
        authority,
        client_id: clientId,
        redirect_uri:
          window.location.origin +
          (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") +
          "/",
        onSigninCallback: () => {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search
          );
        },
      }
    : null;

export function LoginSplash({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, signinRedirect, error } = useAuth();

  if (isLoading) {
    return (
      <AbsoluteCenter>
        <Spinner size="xl" />
      </AbsoluteCenter>
    );
  }

  if (!isAuthenticated) {
    return (
      <AbsoluteCenter>
        <VStack gap={6}>
          <Heading size="2xl">
            <HStack>
              stac-map with auth <LuLock />
            </HStack>
          </Heading>
          {error && (
            <Text color="fg.error" fontSize="sm">
              {error.message}
            </Text>
          )}
          <Button size="lg" onClick={() => signinRedirect()}>
            Sign in
          </Button>
        </VStack>
      </AbsoluteCenter>
    );
  }

  return <>{children}</>;
}

interface UserButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const UserButton = React.forwardRef<HTMLButtonElement, UserButtonProps>(
  function UserButton(props, ref) {
    const { user, removeUser } = useAuth();

    return (
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <IconButton
            variant="ghost"
            aria-label="User info"
            ref={ref}
            {...props}
          >
            <LuUser />
          </IconButton>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>User Info</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={2}>
                  {user?.profile?.name && (
                    <Text>
                      <Text as="span" fontWeight="bold">
                        Name:
                      </Text>{" "}
                      {user.profile.name}
                    </Text>
                  )}
                  {user?.profile?.email && (
                    <Text>
                      <Text as="span" fontWeight="bold">
                        Email:
                      </Text>{" "}
                      {user.profile.email}
                    </Text>
                  )}
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="outline"
                  onClick={() => removeUser()}
                  colorPalette="red"
                >
                  Sign out
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  }
);
