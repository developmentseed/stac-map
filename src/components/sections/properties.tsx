import type { ReactNode } from "react";
import { LuFileJson } from "react-icons/lu";
import { Code, DataList, Dialog, IconButton, Portal } from "@chakra-ui/react";

export default function Properties({
  properties,
}: {
  properties: { [k: string]: unknown };
}) {
  return (
    <DataList.Root size={"sm"} orientation={"horizontal"}>
      {Object.keys(properties).map((key) => (
        <Property key={key} propertyKey={key} propertyValue={properties[key]} />
      ))}
    </DataList.Root>
  );
}

function Property({
  propertyKey,
  propertyValue,
}: {
  propertyKey: string;
  propertyValue: unknown;
}) {
  return (
    <DataList.Item>
      <DataList.ItemLabel>{propertyKey}</DataList.ItemLabel>
      <DataList.ItemValue>{getValue(propertyValue)}</DataList.ItemValue>
    </DataList.Item>
  );
}

function getValue(value: unknown): ReactNode {
  switch (typeof value) {
    case "string":
    case "number":
    case "bigint":
    case "boolean":
    case "undefined":
      return value;
    case "object":
      return (
        <Dialog.Root size={"lg"}>
          <Dialog.Trigger asChild>
            <IconButton size={"2xs"} variant={"plain"} p={0}>
              <LuFileJson />
            </IconButton>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Body>
                  <pre>
                    <Code>{JSON.stringify(value, null, 2)}</Code>
                  </pre>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      );
    case "symbol":
    case "function":
      return null;
  }
}
