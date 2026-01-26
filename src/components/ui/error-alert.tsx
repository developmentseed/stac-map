import { Alert } from "@chakra-ui/react";

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
