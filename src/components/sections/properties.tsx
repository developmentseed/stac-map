import { LuList } from "react-icons/lu";
import { Properties, type PropertiesProps } from "../properties";
import Section from "../section";

export default function PropertiesSection({ ...props }: PropertiesProps) {
  return (
    <Section title="Properties" TitleIcon={LuList} value="properties">
      <Properties {...props} />
    </Section>
  );
}
