import { useMemo, useRef, useState } from "react";
import { LuSearch } from "react-icons/lu";
import {
  CloseButton,
  Combobox,
  createListCollection,
  Field,
  HStack,
  Input,
  InputGroup,
  Portal,
  SegmentGroup,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import type { StacCollection } from "stac-ts";
import type { NaturalLanguageCollectionSearchResult } from "../../types/stac";
import CollectionCard from "../cards/collection";

export default function CollectionSearch({
  collections,
  catalogHref,
  setHref,
}: {
  collections: StacCollection[];
  catalogHref: string | undefined;
  setHref: (href: string | undefined) => void;
}) {
  const [value, setValue] = useState<"Text" | "Natural language">("Text");
  return (
    <Stack>
      <HStack justify={"space-between"}>
        <SegmentGroup.Root
          size={"xs"}
          value={value}
          onValueChange={(e) =>
            setValue(e.value as "Text" | "Natural language")
          }
        >
          <SegmentGroup.Indicator></SegmentGroup.Indicator>
          <SegmentGroup.Items
            items={[
              { label: "Text", value: "Text" },
              {
                label: "Natural language",
                value: "Natural language",
                disabled: !catalogHref,
              },
            ]}
          />
        </SegmentGroup.Root>
      </HStack>
      {value === "Text" && (
        <CollectionCombobox
          collections={collections}
          setHref={setHref}
        ></CollectionCombobox>
      )}
      {value === "Natural language" && catalogHref && (
        <NaturalLanguageCollectionSearch
          href={catalogHref}
          setHref={setHref}
          collections={collections}
        ></NaturalLanguageCollectionSearch>
      )}
    </Stack>
  );
}

function CollectionCombobox({
  collections,
  setHref,
}: {
  collections: StacCollection[];
  setHref: (href: string | undefined) => void;
}) {
  const [searchValue, setSearchValue] = useState("");

  const filteredCollections = useMemo(() => {
    return collections.filter(
      (collection) =>
        collection.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        collection.id.toLowerCase().includes(searchValue.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, collections]);

  const collection = useMemo(
    () =>
      createListCollection({
        items: filteredCollections,
        itemToString: (collection) => collection.title || collection.id,
        itemToValue: (collection) => collection.id,
      }),

    [filteredCollections]
  );

  return (
    <Combobox.Root
      collection={collection}
      multiple
      closeOnSelect
      onInputValueChange={(details) => setSearchValue(details.inputValue)}
      onSelect={(details) => {
        const collection = collections.find(
          (collection) => collection.id == details.itemValue
        );
        if (collection) {
          const selfHref = collection.links.find(
            (link) => link.rel == "self"
          )?.href;
          if (selfHref) {
            setHref(selfHref);
          }
        }
      }}
    >
      <Combobox.Control>
        <Combobox.Input placeholder="Search collections by title, id, or description" />

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

              <Combobox.Empty>No collections found</Combobox.Empty>
            </Combobox.ItemGroup>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
}

function NaturalLanguageCollectionSearch({
  href,
  setHref,
  collections,
}: {
  href: string;
  setHref: (href: string | undefined) => void;
  collections: StacCollection[];
}) {
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
      {query && (
        <Results
          query={query}
          href={href}
          setHref={setHref}
          collections={collections}
        ></Results>
      )}
    </Stack>
  );
}

function Results({
  query,
  href,
  setHref,
  collections,
}: {
  query: string;
  href: string;
  setHref: (href: string | undefined) => void;
  collections: StacCollection[];
}) {
  const { data } = useQuery<{
    results: NaturalLanguageCollectionSearchResult[];
  }>({
    queryKey: [href, query],
    queryFn: async () => {
      const body = JSON.stringify({
        query,
        catalog_url: href,
      });
      const url = new URL(
        "search",
        import.meta.env.VITE_STAC_NATURAL_QUERY_API
      );
      return await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }).then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(
            `Error while doing a natural language search against ${href}: ${response.statusText}`
          );
        }
      });
    },
  });

  const results = useMemo(() => {
    return data?.results.map(
      (result: NaturalLanguageCollectionSearchResult) => {
        return {
          result,
          collection: collections.find(
            (collection) => collection.id == result.collection_id
          ),
        };
      }
    );
  }, [data, collections]);

  if (results) {
    return (
      <Stack>
        {results.map((result) => {
          if (result.collection) {
            return (
              <CollectionCard
                collection={result.collection}
                key={result.collection.id}
                footer={result.result.explanation}
                setHref={setHref}
              ></CollectionCard>
            );
          } else {
            return null;
          }
        })}
      </Stack>
    );
  } else {
    return <SkeletonText></SkeletonText>;
  }
}
