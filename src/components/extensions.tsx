import { Badge, Flex } from "@chakra-ui/react";

export default function Extensions({ extensions }: { extensions: string[] }) {
  return (
    <Flex gap={2} wrap="wrap">
      {extensions.map((extension) => (
        <Extension key={extension} extension={extension} />
      ))}
    </Flex>
  );
}

function Extension({ extension }: { extension: string }) {
  const parsed = parseExtension(extension);
  if (!parsed) return null;
  return (
    <Badge variant={"surface"}>
      {parsed.name} {parsed.version}
    </Badge>
  );
}

function parseExtension(
  extension: string
): { name: string; version: string } | null {
  const parts = extension.split("/");
  const versionIndex = parts.findIndex((part) => /^v\d+\.\d+\.\d+$/.test(part));
  if (versionIndex < 1) return null;
  return { name: parts[versionIndex - 1], version: parts[versionIndex] };
}
