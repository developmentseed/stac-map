import Json from "@/components/ui/json";
import Section from "@/components/ui/section";
import { LuTableProperties } from "react-icons/lu";

export default function Properties({ properties }: { properties: unknown }) {
  return (
    <Section title="Properties" icon={<LuTableProperties />}>
      <Json value={properties} />
    </Section>
  );
}
