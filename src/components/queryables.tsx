import { useQueryables } from "@/hooks/stac";
import type { QueryableFilter } from "@/utils/cql2";
import type { QueryableProperty } from "@/utils/stac";
import {
  Field,
  Fieldset,
  Input,
  NativeSelect,
  SkeletonText,
} from "@chakra-ui/react";
import { useMemo } from "react";

const SKIPPED_PROPERTIES = new Set(["id", "datetime", "geometry"]);

export default function Queryables({
  href,
  value,
  onChange,
}: {
  href: string | undefined;
  value: Record<string, QueryableFilter>;
  onChange: (value: Record<string, QueryableFilter>) => void;
}) {
  const result = useQueryables(href);

  const properties = useMemo(() => {
    return Object.entries(result.data?.properties ?? {}).filter(
      ([key, property]) =>
        !SKIPPED_PROPERTIES.has(key) && (property.type || property.enum)
    );
  }, [result.data]);

  if (!href) return null;
  if (result.isLoading) return <SkeletonText h={3} />;
  if (result.error || properties.length === 0) return null;

  const setFilter = (key: string, filter: QueryableFilter | undefined) => {
    const isEmpty =
      !filter ||
      (filter.eq === undefined &&
        filter.gte === undefined &&
        filter.lte === undefined);
    const next = { ...value };
    if (isEmpty) delete next[key];
    else next[key] = filter;
    onChange(next);
  };

  return (
    <Fieldset.Root size={"sm"}>
      <Fieldset.Legend>Queryables</Fieldset.Legend>
      <Fieldset.Content>
        {properties.map(([key, property]) => (
          <QueryableField
            key={key}
            name={key}
            property={property}
            value={value[key]}
            onChange={(filter) => setFilter(key, filter)}
          />
        ))}
      </Fieldset.Content>
    </Fieldset.Root>
  );
}

function QueryableField({
  name,
  property,
  value,
  onChange,
}: {
  name: string;
  property: QueryableProperty;
  value: QueryableFilter | undefined;
  onChange: (filter: QueryableFilter | undefined) => void;
}) {
  const label = property.title ?? property.description ?? name;

  if (property.enum) {
    return (
      <Field.Root orientation={"horizontal"}>
        <Field.Label color={"fg.muted"} fontWeight={"normal"}>
          {label}
        </Field.Label>
        <NativeSelect.Root size={"sm"}>
          <NativeSelect.Field
            value={value?.eq === undefined ? "" : String(value.eq)}
            onChange={(e) => {
              // Keep the option's own type: a boolean or number stays one
              const option = property.enum?.find(
                (option) => String(option) === e.target.value
              );
              onChange(option === undefined ? undefined : { eq: option });
            }}
          >
            <option value="">Any</option>
            {property.enum.map((option) => (
              <option key={String(option)} value={String(option)}>
                {String(option)}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
    );
  }

  // A nullable number is typed ["integer", "null"]
  const types = [property.type].flat();
  if (types.includes("number") || types.includes("integer")) {
    return (
      <Field.Root orientation={"horizontal"}>
        <Field.Label color={"fg.muted"} fontWeight={"normal"}>
          {label}
        </Field.Label>
        <Input
          size={"sm"}
          type={"number"}
          placeholder={
            property.minimum !== undefined ? `Min (${property.minimum})` : "Min"
          }
          value={value?.gte ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              gte: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
        <Input
          size={"sm"}
          type={"number"}
          placeholder={
            property.maximum !== undefined ? `Max (${property.maximum})` : "Max"
          }
          value={value?.lte ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              lte: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </Field.Root>
    );
  }

  return (
    <Field.Root orientation={"horizontal"}>
      <Field.Label color={"fg.muted"} fontWeight={"normal"}>
        {label}
      </Field.Label>
      <Input
        size={"sm"}
        value={value?.eq === undefined ? "" : String(value.eq)}
        onChange={(e) =>
          onChange(e.target.value ? { eq: e.target.value } : undefined)
        }
      />
    </Field.Root>
  );
}
