import {
  Button,
  CloseButton,
  Combobox,
  createListCollection,
  Popover,
  Portal,
  Stack,
  Text,
  Wrap,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import type { StacCollection, StacLink } from "stac-ts";
import {
  useAppDispatch,
  useAppState,
  useSelectedCollections,
} from "../../../hooks";
import Collection from "../collection";

export function ItemSearch({ links }: { links: StacLink[] }) {
  const selectedCollections = useSelectedCollections();

  return (
    <Stack gap={4}>
      <CollectionCombobox></CollectionCombobox>
      <Wrap overflow={"scroll"}>
        {(selectedCollections.length > 0 &&
          selectedCollections.map((collection) => (
            <CollectionButton
              key={collection.id}
              collection={collection}
            ></CollectionButton>
          ))) || <Text fontSize={"sm"}>No collections selected</Text>}
      </Wrap>
    </Stack>
  );
}

function CollectionCombobox() {
  const { collections, selectedCollectionIds: appSelectedCollectionIds } =
    useAppState();
  const [searchValue, setSearchValue] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    [],
  );
  const dispatch = useAppDispatch();

  const filteredCollections = useMemo(() => {
    return collections.filter(
      (collection) =>
        collection.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        collection.id.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue, collections]);

  const collection = useMemo(
    () =>
      createListCollection({
        items: filteredCollections,
        itemToString: (collection) => collection.title || collection.id,
        itemToValue: (collection) => collection.id,
      }),
    [filteredCollections],
  );

  useEffect(() => {
    setSelectedCollectionIds([...appSelectedCollectionIds]);
  }, [appSelectedCollectionIds, setSelectedCollectionIds]);

  return (
    <Combobox.Root
      collection={collection}
      value={selectedCollectionIds}
      multiple
      closeOnSelect
      onValueChange={(details) =>
        dispatch({
          type: "set-selected-collection-ids",
          collectionIds: new Set(details.value),
        })
      }
      onInputValueChange={(details) => setSearchValue(details.inputValue)}
    >
      <Combobox.Control>
        <Combobox.Input
          placeholder={
            (appSelectedCollectionIds.size == 0 &&
              "Select one or more collections") ||
            `${appSelectedCollectionIds.size} collection${(appSelectedCollectionIds.size > 1 && "s") || ""} selected`
          }
        />
        <Combobox.IndicatorGroup>
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.ItemGroup>
              {filteredCollections.map((collection) => (
                <Combobox.Item key={collection.id} item={collection}>
                  {collection.title || collection.id}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
              <Combobox.Empty>No skills found</Combobox.Empty>
            </Combobox.ItemGroup>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
}

function CollectionButton({ collection }: { collection: StacCollection }) {
  const dispatch = useAppDispatch();

  return (
    <Popover.Root lazyMount unmountOnExit>
      <Popover.Trigger asChild>
        <Button variant={"subtle"} size={"xs"}>
          {collection.title || collection.id}
          <CloseButton
            as={"a"}
            size={"2xs"}
            mr={-2}
            variant={"ghost"}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: "deselect-collection", id: collection.id });
            }}
          ></CloseButton>
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow></Popover.Arrow>
            <Popover.Body overflow={"scroll"}>
              <Collection collection={collection} map={false}></Collection>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
