import { LuTableProperties } from "react-icons/lu";
import { Json } from "../json";
import { Section } from "../section";

export default function Properties({ properties }: { properties: unknown }) {
  return (
    <Section title="Properties" icon={<LuTableProperties />} open={false}>
      <Json value={properties} />
    </Section>
  );
}
