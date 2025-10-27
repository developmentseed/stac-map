import { type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { type IconType } from "react-icons/lib";
import { Accordion, Alert, Button, HStack, Icon, Span } from "@chakra-ui/react";

export default function Section({
  title,
  TitleIcon,
  value,
  children,
}: {
  title: ReactNode;
  TitleIcon: IconType;
  value: string;
  children: ReactNode;
}) {
  return (
    <Accordion.Item value={value}>
      <Accordion.ItemTrigger>
        <HStack flex={"1"}>
          <Icon>
            <TitleIcon />
          </Icon>{" "}
          {title}
        </HStack>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>
        <Accordion.ItemBody>
          <ErrorBoundary FallbackComponent={FallbackComponent}>
            {children}
          </ErrorBoundary>
        </Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}

function FallbackComponent({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <Alert.Root status={"error"}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>An error occurred during rendering</Alert.Title>
        <Alert.Description>
          <HStack>
            <Span>{error.message}</Span>
            <Button
              size={"sm"}
              variant={"surface"}
              onClick={resetErrorBoundary}
            >
              Reload section
            </Button>
          </HStack>
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
