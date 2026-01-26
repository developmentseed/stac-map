import { Box, Span } from "@chakra-ui/react";

function JsonArray({ arr, depth }: { arr: unknown[]; depth: number }) {
  if (arr.length === 0) {
    return null;
  }

  return (
    <>
      {arr.map((item, index) => (
        <Box key={index} marginLeft={depth > 0 ? 4 : 0}>
          <JsonValue value={item} depth={depth + 1} />
        </Box>
      ))}
    </>
  );
}

function JsonObject({
  obj,
  depth,
}: {
  obj: Record<string, unknown>;
  depth: number;
}) {
  const entries = Object.entries(obj);

  if (entries.length === 0) {
    return null;
  }

  return (
    <>
      {entries.map(([key, value]) => (
        <Box key={key} marginLeft={depth > 0 ? 4 : 0}>
          <Span color="fg.muted">{key}</Span>
          <Span> </Span>
          <JsonValue value={value} depth={depth + 1} />
        </Box>
      ))}
    </>
  );
}

function JsonValue({ value, depth }: { value: unknown; depth: number }) {
  if (value === null) {
    return <Span color="fg.muted">null</Span>;
  }

  if (typeof value === "string") {
    return <Span color="green.500">{value}</Span>;
  }

  if (typeof value === "number") {
    return <Span color="blue.500">{value}</Span>;
  }

  if (typeof value === "boolean") {
    return <Span color="orange.500">{value ? "true" : "false"}</Span>;
  }

  if (Array.isArray(value)) {
    return <JsonArray arr={value} depth={depth} />;
  }

  if (typeof value === "object") {
    return <JsonObject obj={value as Record<string, unknown>} depth={depth} />;
  }

  return <Span>{String(value)}</Span>;
}

export function Json({ value }: { value: unknown }) {
  return (
    <Box fontFamily="mono" fontSize="sm">
      <JsonValue value={value} depth={0} />
    </Box>
  );
}
