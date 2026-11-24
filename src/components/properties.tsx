import Json from "@/components/ui/json";
import Section from "@/components/ui/section";
import { LuTableProperties } from "react-icons/lu";

export default function Properties({
  properties,
}: {
  properties: Record<string, unknown>;
}) {
  return (
    <Section title="Properties" icon={<LuTableProperties />}>
      <Json
        value={Object.fromEntries(
          Object.entries(properties).sort(([keyA], [keyB]) =>
            keyA.localeCompare(keyB)
          )
        )}
      />
    </Section>
  );
}
