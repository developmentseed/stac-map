import {
  Accordion,
  createTreeCollection,
  FormatNumber,
  Span,
  Stack,
  Table,
  Text,
  TreeView,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuCircle, LuCircleDot } from "react-icons/lu";
import useStacMap from "../hooks/stac-map";
import type { StacGeoparquetMetadata, StacItemCollection } from "../types/stac";
import Value from "./value";

export default function ItemCollection({
  itemCollection,
}: {
  itemCollection: StacItemCollection;
}) {
  const { stacGeoparquetMetadata } = useStacMap();

  return (
    <Stack>
      <Value value={itemCollection}>
        {itemCollection.features.length > 0 &&
          itemCollection.features.length +
            " item" +
            (itemCollection.features.length > 1 ? "s" : "")}
      </Value>
      {stacGeoparquetMetadata && (
        <StacGeoparquetInfo
          metadata={stacGeoparquetMetadata}
        ></StacGeoparquetInfo>
      )}
    </Stack>
  );
}

interface Node {
  id: string;
  value: ReactNode;
  children?: Node[];
}

function StacGeoparquetInfo({
  metadata,
}: {
  metadata: StacGeoparquetMetadata;
}) {
  const collection = createTreeCollection<Node>({
    rootNode: {
      id: "root",
      value: "Metadata",
      children: metadata.keyValue.map((kv) => intoNode(kv.key, kv.value)),
    },
  });

  return (
    <Stack gap={4}>
      <Text fontSize={"sm"}>
        Number of items: <FormatNumber value={metadata.count}></FormatNumber>
      </Text>
      <Accordion.Root collapsible defaultValue={["schema"]}>
        <Accordion.Item value="schema">
          <Accordion.ItemTrigger>
            <Span flex={1}>Schema</Span>
            <Accordion.ItemIndicator></Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <Table.Root size={"sm"}>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Type</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {metadata.describe.map((row) => (
                    <Table.Row key={row.column_name}>
                      <Table.Cell>{row.column_name}</Table.Cell>
                      <Table.Cell>{row.column_type}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item value="metadata">
          <Accordion.ItemTrigger>
            <Span flex={1}>Key-value metadata</Span>
            <Accordion.ItemIndicator></Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              <TreeView.Root collection={collection} variant={"subtle"}>
                <TreeView.Tree>
                  <TreeView.Node
                    indentGuide={
                      <TreeView.BranchIndentGuide></TreeView.BranchIndentGuide>
                    }
                    render={({ node, nodeState }) =>
                      nodeState.isBranch ? (
                        <TreeView.BranchControl>
                          <LuCircleDot></LuCircleDot>
                          <TreeView.BranchText>
                            {node.value}
                          </TreeView.BranchText>
                        </TreeView.BranchControl>
                      ) : (
                        <TreeView.Item>
                          <LuCircle></LuCircle>
                          <TreeView.ItemText>{node.value}</TreeView.ItemText>
                        </TreeView.Item>
                      )
                    }
                  ></TreeView.Node>
                </TreeView.Tree>
              </TreeView.Root>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
}

// eslint-disable-next-line
function intoNode(key: string, value: any) {
  const children: Node[] = [];

  switch (typeof value) {
    case "string":
    case "number":
    case "bigint":
    case "boolean":
      children.push({
        id: `${key}-value`,
        value: value.toString(),
      });
      break;
    case "symbol":
    case "undefined":
    case "function":
      children.push({
        id: `${key}-value`,
        value: (
          <Text fontWeight="lighter" fontStyle={"italic"}>
            opaque
          </Text>
        ),
      });
      break;
    case "object":
      if (Array.isArray(value)) {
        children.push(
          ...value.map((v, index) => intoNode(index.toString(), v)),
        );
      } else {
        children.push(...Object.entries(value).map(([k, v]) => intoNode(k, v)));
      }
  }

  return {
    id: key,
    value: key,
    children,
  };
}
