import {
  ActionBar,
  Button,
  ButtonGroup,
  Portal,
} from "@chakra-ui/react";
import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { LuForward, LuPause, LuPlay } from "react-icons/lu";

export default function PaginationBar({
  count,
  numberMatched,
  noun,
  isFetchingAll,
  setIsFetchingAll,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
}: {
  count: number;
  numberMatched: number | undefined;
  noun: string;
  isFetchingAll: boolean;
  setIsFetchingAll: (isFetchingAll: boolean) => void;
} & Pick<
  UseInfiniteQueryResult,
  "fetchNextPage" | "isFetchingNextPage" | "hasNextPage"
>) {
  return (
    <ActionBar.Root open={true}>
      <Portal>
        <ActionBar.Positioner>
          <ActionBar.Content>
            <ActionBar.SelectionTrigger>
              {count}
              {numberMatched !== undefined && "/" + numberMatched} {noun}
              {count !== 1 && "s"} loaded
            </ActionBar.SelectionTrigger>
            {hasNextPage && (
              <>
                <ActionBar.Separator />
                <ButtonGroup size={"sm"} variant={"outline"}>
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage || isFetchingAll}
                  >
                    <LuForward />
                    Next page
                  </Button>
                  <Button onClick={() => setIsFetchingAll(!isFetchingAll)}>
                    {isFetchingAll ? <LuPause /> : <LuPlay />}
                    Fetch all
                  </Button>
                </ButtonGroup>
              </>
            )}
          </ActionBar.Content>
        </ActionBar.Positioner>
      </Portal>
    </ActionBar.Root>
  );
}
