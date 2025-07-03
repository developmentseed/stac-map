import {
  Accordion,
  ActionBar,
  Alert,
  Button,
  IconButton,
  Portal,
  Span,
  Tabs,
  type UseFileUploadReturn,
} from "@chakra-ui/react";
import type { Layer } from "@deck.gl/core";
import {
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { LuFocus, LuInfo, LuSearch, LuUpload, LuX } from "react-icons/lu";
import Loading from "./components/loading";
import { useStacValue } from "./components/stac/hooks";
import { getCollectionsLayer } from "./components/stac/layers";
import { ItemSearch } from "./components/stac/search/item";
import { NaturalLanguageCollectionSearch } from "./components/stac/search/natural-language";
import type { StacValue } from "./components/stac/types";
import { getCollectionsExtent, getValue } from "./components/stac/utils";
import { toaster } from "./components/ui/toaster";
import Upload from "./components/upload";
import {
  AppContext,
  AppDispatchContext,
  appReducer,
  type AppAction,
  type AppState,
} from "./context";
import { useAppDispatch, useFitBbox, useSelectedCollections } from "./hooks";

export default function Panel({
  href,
  fileUpload,
  setLayers,
}: {
  href: string;
  fileUpload: UseFileUploadReturn;
  setLayers: Dispatch<SetStateAction<Layer[]>>;
}) {
  const { value, parquetPath, loading, error } = useStacValue(href, fileUpload);
  const [tabValue, setTabValue] = useState("value");
  const [state, dispatch] = useReducer(appReducer, {
    layer: null,
    pickedLayer: null,
    collections: [],
    selectedCollectionIds: new Set<string>(),
  });
  const [search, setSearch] = useState<ReactNode | undefined>();

  useEffect(() => {
    dispatch({ type: "deselect-all-collections" });
  }, [value, dispatch]);

  useEffect(() => {
    if (value) {
      setTabValue("value");
      setSearch(getSearch(value));
    }
  }, [value, setTabValue, setSearch]);

  useEffect(() => {
    if (error) {
      toaster.create({
        type: "error",
        title: "Error while loading STAC value",
        description: error,
      });
    }
  }, [error]);

  useEffect(() => {
    const layers = [];
    if (state.pickedLayer) {
      layers.push(state.pickedLayer.clone({ id: "picked" }));
    }
    const selectedCollections = state.collections.filter((collection) =>
      state.selectedCollectionIds.has(collection.id),
    );
    if (selectedCollections.length > 0) {
      const layer = getCollectionsLayer(selectedCollections, true);
      layers.push(layer.clone({ id: "selected-collections" }));
    }
    if (state.layer) {
      layers.push(state.layer.clone({ id: "layer" }));
    }
    setLayers(layers);
  }, [
    state.layer,
    state.pickedLayer,
    state.collections,
    state.selectedCollectionIds,
    setLayers,
  ]);

  return (
    <Provider state={state} dispatch={dispatch}>
      <Tabs.Root
        value={tabValue}
        onValueChange={(e) => setTabValue(e.value)}
        bg={"bg.muted"}
        rounded={4}
      >
        <Tabs.List>
          <Tabs.Trigger value="value" disabled={!value}>
            <LuInfo></LuInfo>
          </Tabs.Trigger>
          <Tabs.Trigger value="search" disabled={!search}>
            <LuSearch></LuSearch>
          </Tabs.Trigger>
          <Tabs.Trigger value="upload">
            <LuUpload></LuUpload>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.ContentGroup overflow={"scroll"} maxH={"80dvh"} px={4} pb={4}>
          <Tabs.Content value="value">
            {(loading && <Loading></Loading>) ||
              (value &&
                (getValue(value, parquetPath) || (
                  <InvalidStacValue
                    href={href}
                    value={value}
                  ></InvalidStacValue>
                )))}
          </Tabs.Content>
          <Tabs.Content value="search">{search}</Tabs.Content>
          <Tabs.Content value="upload">
            <Upload fileUpload={fileUpload}></Upload>
          </Tabs.Content>
        </Tabs.ContentGroup>
      </Tabs.Root>
      <SelectedCollectionsActionBar></SelectedCollectionsActionBar>
    </Provider>
  );
}

function InvalidStacValue({ href, value }: { href: string; value: StacValue }) {
  return (
    <Alert.Root status={"error"}>
      <Alert.Indicator></Alert.Indicator>
      <Alert.Content>
        <Alert.Title>Invalid STAC value</Alert.Title>
        <Alert.Description>
          STAC value at {href} has an invalid type field: {value.type}
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}

function Provider({
  state,
  dispatch,
  children,
}: {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  children: ReactNode;
}) {
  return (
    <AppContext value={state}>
      <AppDispatchContext value={dispatch}>{children}</AppDispatchContext>
    </AppContext>
  );
}

function SelectedCollectionsActionBar() {
  const collections = useSelectedCollections();
  const fitBbox = useFitBbox();
  const dispatch = useAppDispatch();

  return (
    <ActionBar.Root open={collections.length > 0}>
      <Portal>
        <ActionBar.Positioner>
          <ActionBar.Content>
            <ActionBar.SelectionTrigger>
              {collections.length} collection{collections.length > 1 && "s"}{" "}
              selected
            </ActionBar.SelectionTrigger>
            <ActionBar.Separator></ActionBar.Separator>
            <IconButton
              variant={"outline"}
              size={"xs"}
              onClick={() => fitBbox(getCollectionsExtent(collections))}
            >
              <LuFocus></LuFocus>
            </IconButton>
            <Button
              size={"xs"}
              variant={"outline"}
              onClick={() => dispatch({ type: "deselect-all-collections" })}
            >
              <LuX></LuX> Deselect all
            </Button>
          </ActionBar.Content>
        </ActionBar.Positioner>
      </Portal>
    </ActionBar.Root>
  );
}

function getSearch(value: StacValue) {
  const searchLinks = value.links?.filter((link) => link.rel == "search") ?? [];
  const selfLink = value.links?.find((link) => link.rel == "self");

  const itemSearch =
    (searchLinks.length > 0 && <ItemSearch links={searchLinks}></ItemSearch>) ||
    undefined;
  const naturalLanguageCollectionSearch =
    (value.type == "Catalog" && selfLink && (
      <NaturalLanguageCollectionSearch
        href={selfLink.href}
      ></NaturalLanguageCollectionSearch>
    )) ||
    undefined;

  if (itemSearch || naturalLanguageCollectionSearch) {
    return (
      <Search
        item={itemSearch}
        naturalLanguageCollection={naturalLanguageCollectionSearch}
      ></Search>
    );
  } else {
    return null;
  }
}

function Search({
  item,
  naturalLanguageCollection,
}: {
  item: ReactNode | undefined;
  naturalLanguageCollection: ReactNode | undefined;
}) {
  return (
    <Accordion.Root
      collapsible
      defaultValue={[
        (item && "item") ||
          (naturalLanguageCollection && "natural-language-collection") ||
          "",
      ]}
      variant={"enclosed"}
    >
      {item && (
        <Accordion.Item value="item">
          <Accordion.ItemTrigger>
            <Span flex="1">Item search</Span>
            <Accordion.ItemIndicator></Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent py={4}>{item}</Accordion.ItemContent>
        </Accordion.Item>
      )}
      {naturalLanguageCollection && (
        <Accordion.Item value="natural-language-collection">
          <Accordion.ItemTrigger>
            <Span flex="1">Natural language collection search</Span>
            <Accordion.ItemIndicator></Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent py={4}>
            {naturalLanguageCollection}
          </Accordion.ItemContent>
        </Accordion.Item>
      )}
    </Accordion.Root>
  );
}
