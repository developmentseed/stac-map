import { useRef, useState } from "react";
import { LuFolderSearch, LuSearch } from "react-icons/lu";
import {
  Button,
  CloseButton,
  Group,
  Input,
  InputGroup,
} from "@chakra-ui/react";
import { Section } from "./section";
import { useStore } from "../store";

export default function CollectionSearch() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setCollectionFreeTextSearch = useStore(
    (store) => store.setCollectionFreeTextSearch
  );

  return (
    <Section icon={<LuFolderSearch />} title="Collection search">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCollectionFreeTextSearch(input);
        }}
      >
        <Group attached width={"full"}>
          <InputGroup
            flex={1}
            endElement={
              input && (
                <CloseButton
                  size={"xs"}
                  me="-2"
                  onClick={() => {
                    setInput("");
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
    </Section>
  );
}
