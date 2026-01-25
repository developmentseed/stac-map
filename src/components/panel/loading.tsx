import { SkeletonText, Spinner } from "@chakra-ui/react";
import type { UseQueryResult } from "@tanstack/react-query";
import { LuFileWarning } from "react-icons/lu";

import { ResultError } from "../result-error";
import { BasePanel, PanelHeader } from "./base";

export function LoadingPanel({
  href,
  isFetching,
  error,
}: { href: string } & UseQueryResult) {
  const header = (
    <PanelHeader
      icon={
        error ? (
          <LuFileWarning />
        ) : isFetching ? (
          <Spinner size="xs" />
        ) : undefined
      }
    >
      {error
        ? `Error loading ${href}`
        : isFetching
          ? `Fetching ${href}`
          : "stac-map"}
    </PanelHeader>
  );

  return (
    <BasePanel header={header}>
      {error ? (
        <ResultError title={error.name} error={error} />
      ) : (
        <SkeletonText />
      )}
    </BasePanel>
  );
}
