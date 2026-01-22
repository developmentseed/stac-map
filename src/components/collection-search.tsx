import { useState } from "react";
import { LuFolderSearch, LuSearch } from "react-icons/lu";
import { Button, Group, Heading, HStack, Input, Stack } from "@chakra-ui/react";
import { useStore } from "../store";

export default function CollectionSearch() {
  const [input, setInput] = useState("");
  const setCollectionFreeTextSearch = useStore(
    (store) => store.setCollectionFreeTextSearch
  );

  return (
    <Stack>
      <Heading size={"md"}>
        <HStack>
          <LuFolderSearch /> Collection search
        </HStack>
      </Heading>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCollectionFreeTextSearch(input);
        }}
      >
        <Group attached width={"full"}>
          <Input
            placeholder="Free-text collection search"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
          />
          <Button variant={"outline"} type="submit">
            <LuSearch /> Search
          </Button>
        </Group>
      </form>
    </Stack>
  );
}
