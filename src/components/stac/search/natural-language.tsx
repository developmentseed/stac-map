import {
  Center,
  CloseButton,
  DataList,
  Field,
  Heading,
  Input,
  InputGroup,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useAppDispatch, useAppState, useFitBbox } from "../../../hooks";
import { toaster } from "../../ui/toaster";
import { useNaturalLanguageCollectionSearch } from "../hooks";
import { getCollectionsExtent } from "../utils";

export function NaturalLanguageCollectionSearch({ href }: { href: string }) {
  const [query, setQuery] = useState<string | undefined>();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const endElement = value ? (
    <CloseButton
      size="xs"
      onClick={() => {
        setValue("");
        setQuery(undefined);
        inputRef.current?.focus();
      }}
      me="-2"
    />
  ) : undefined;

  return (
    <Stack gap={4}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(value);
        }}
      >
        <Field.Root>
          <InputGroup
            startElement={<LuSearch></LuSearch>}
            endElement={endElement}
          >
            <Input
              size={"sm"}
              placeholder="Find collections that..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            ></Input>
          </InputGroup>
          <Field.HelperText>
            Natural language collection search is experimental, and can be
            rather slow.
          </Field.HelperText>
        </Field.Root>
      </form>
      {query && <Results query={query} href={href}></Results>}
    </Stack>
  );
}

function Results({ query, href }: { query: string; href: string }) {
  const { results, loading, error } = useNaturalLanguageCollectionSearch(
    query,
    href,
  );
  const dispatch = useAppDispatch();
  const fitBbox = useFitBbox();
  const { collections } = useAppState();

  useEffect(() => {
    if (error) {
      toaster.create({
        type: "error",
        title: "Error during natural language collection search",
        description: error,
      });
    }
  }, [error]);

  useEffect(() => {
    if (results) {
      const collectionIds = new Set<string>();
      dispatch({ type: "deselect-all-collections" });
      results.forEach((result) => {
        dispatch({ type: "select-collection", id: result.collection_id });
        collectionIds.add(result.collection_id);
      });
      fitBbox(
        getCollectionsExtent(
          collections.filter((collection) => collectionIds.has(collection.id)),
        ),
      );
    }
  }, [results, dispatch, collections, fitBbox]);

  if (loading) {
    return (
      <Center>
        <Spinner size={"sm"}></Spinner>
      </Center>
    );
  } else if (results) {
    return (
      <Stack>
        <Heading size={"md"}>
          Found {results.length} result{results.length > 1 && "s"}
        </Heading>
        <DataList.Root size={"sm"}>
          {results.map((result) => (
            <DataList.Item key={result.collection_id}>
              <DataList.ItemLabel>{result.collection_id}</DataList.ItemLabel>
              <DataList.ItemValue>{result.explanation}</DataList.ItemValue>
            </DataList.Item>
          ))}
        </DataList.Root>
      </Stack>
    );
  }
}
