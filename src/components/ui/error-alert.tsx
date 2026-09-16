import { Alert, CloseButton, HStack, Link } from "@chakra-ui/react";
import { useState } from "react";
import { LuGithub } from "react-icons/lu";

export function ErrorAlert({ title, error }: { title: string; error: Error }) {
  return (
    <Alert.Root status="error">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{error.message}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}

export function WarningAlert({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Alert.Root status="warning">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{description}</Alert.Description>
      </Alert.Content>
      <CloseButton
        size="sm"
        pos="relative"
        top="-2"
        insetEnd="-2"
        onClick={() => setDismissed(true)}
      />
    </Alert.Root>
  );
}

export function ErrorBoundaryAlert({
  context,
  error,
}: {
  context: string;
  error: unknown;
}) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <Alert.Root status="error">
      <Alert.Indicator />
      <Alert.Content gap={4}>
        <Alert.Title>
          <HStack>We're really sorry!</HStack>
        </Alert.Title>
        <Alert.Description>
          Something went wrong in the {context}. The error message is "{message}
          ". Please{" "}
          <Link href="https://github.com/developmentseed/stac-map/issues/new?template=bug_report.md">
            open an issue <LuGithub />
          </Link>{" "}
          so we can fix it!
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
