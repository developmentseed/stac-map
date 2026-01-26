import $RefParser from "@apidevtools/json-schema-ref-parser";
import {
  Button,
  Checkbox,
  CloseButton,
  Dialog,
  Field,
  Fieldset,
  Input,
  NumberInput,
  Portal,
  Stack,
} from "@chakra-ui/react";
import Form from "@rjsf/chakra-ui";
import validator from "@rjsf/validator-ajv8";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LuSettings } from "react-icons/lu";
import type { StacCollection } from "stac-ts";
import { ErrorAlert } from "../ui/error-alert";

interface SearchSettingsDialogProps {
  collection: StacCollection;
  useViewportForBbox: boolean;
  setUseViewportForBbox: (checked: boolean) => void;
  limit: string | undefined;
  setLimit: (value: string) => void;
  disabled: boolean;
  queryablesHref: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryables: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setQueryables: (value: any) => void;
}

export default function SearchSettings({
  collection,
  useViewportForBbox,
  setUseViewportForBbox,
  limit,
  setLimit,
  disabled,
  queryablesHref,
  queryables,
  setQueryables,
}: SearchSettingsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root
      lazyMount
      unmountOnExit
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Dialog.Trigger asChild>
        <Button variant={"subtle"} disabled={disabled}>
          <LuSettings /> Configure
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            onKeyDown={(e) => {
              if (e.key === "Enter") setOpen(false);
            }}
          >
            <Dialog.Header>
              <Dialog.Title>Search settings</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Fieldset.Root>
                  <Fieldset.Content>
                    <Collection collection={collection} />

                    <Bbox
                      useViewportForBbox={useViewportForBbox}
                      setUseViewportForBbox={setUseViewportForBbox}
                    />

                    <Limit limit={limit} setLimit={setLimit} />
                  </Fieldset.Content>
                </Fieldset.Root>

                {queryablesHref && (
                  <Queryables
                    href={queryablesHref}
                    queryables={queryables}
                    setQueryables={setQueryables}
                  />
                )}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size={"sm"} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function Collection({ collection }: { collection: StacCollection }) {
  return (
    <Field.Root>
      <Field.Label>Collection</Field.Label>
      <Input value={collection.id} disabled={true} />
    </Field.Root>
  );
}

function Bbox({
  useViewportForBbox,
  setUseViewportForBbox,
}: {
  useViewportForBbox: boolean;
  setUseViewportForBbox: (value: boolean) => void;
}) {
  return (
    <Field.Root>
      <Field.Label>BBox</Field.Label>
      <Checkbox.Root
        checked={useViewportForBbox}
        onCheckedChange={(e) => setUseViewportForBbox(!!e.checked)}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Use viewport bounding box?</Checkbox.Label>
      </Checkbox.Root>
    </Field.Root>
  );
}

function Limit({
  limit,
  setLimit,
}: {
  limit: string | undefined;
  setLimit: (value: string) => void;
}) {
  return (
    <Field.Root>
      <Field.Label>Limit</Field.Label>
      <NumberInput.Root value={limit} onValueChange={(e) => setLimit(e.value)}>
        <NumberInput.Control />
        <NumberInput.Input />
      </NumberInput.Root>
    </Field.Root>
  );
}

function Queryables({
  href,
  queryables,
  setQueryables,
}: {
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryables: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setQueryables: (value: any) => void;
}) {
  const result = useQuery({
    queryKey: ["queryables", href],
    queryFn: async () => {
      return await fetch(href)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch queryables: " + href);
          }
          return response.json();
        })
        .then((json) => {
          delete json.title;
          delete json.properties.id;
          delete json.properties.datetime;
          delete json.properties.geometry;
          return $RefParser.dereference(json);
        });
    },
  });
  if (result.error)
    return (
      <ErrorAlert
        title="Error while fetching queryables"
        error={result.error}
      />
    );
  else if (result.data)
    return (
      <Stack>
        <Form
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          schema={result.data as any}
          validator={validator}
          formData={queryables}
          onChange={(e) => setQueryables(e.formData)}
          uiSchema={{
            "ui:submitButtonOptions": { norender: true },
          }}
        />
      </Stack>
    );
}
