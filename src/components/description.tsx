import { MarkdownHooks } from "react-markdown";
import { Prose } from "./ui/prose";

export default function Description({ description }: { description: string }) {
  return (
    <Prose>
      <MarkdownHooks>{description}</MarkdownHooks>
    </Prose>
  );
}
