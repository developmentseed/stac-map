import { Section } from "@/components/section";
import { useStore } from "@/store";
import {
  Button,
  CloseButton,
  Group,
  Input,
  InputGroup,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { LuFolderSearch, LuSearch } from "react-icons/lu";

export default function CollectionSearch() {
  return (
    <Section icon={<LuFolderSearch />} title="Collection search">
      <Search />
    </Section>
  );
}

function Search() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setCollectionFreeTextSearch = useStore(
    (store) => store.setCollectionFreeTextSearch
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setCollectionFreeTextSearch(input);
      }}
    >
      <Group width={"full"}>
        <InputGroup
          flex={1}
          endElement={
            input && (
              <CloseButton
                size={"xs"}
                me="-2"
                onClick={() => {
                  setInput("");
                  setCollectionFreeTextSearch("");
                  inputRef.current?.focus();
                }}
              />
            )
          }
        >
          <Input
            placeholder="Free-text collection search"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
          />
        </InputGroup>
        <Button variant={"outline"} type="submit">
          <LuSearch /> Search
        </Button>
      </Group>
    </form>
  );
}
