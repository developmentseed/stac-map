import { createContext, useContext } from "react";
import { EXAMPLES, type Example } from "../constants";

const ExamplesContext = createContext<Example[]>(EXAMPLES);

export function ExamplesProvider({
  examples,
  children,
}: {
  examples?: Example[];
  children: React.ReactNode;
}) {
  return (
    <ExamplesContext.Provider value={examples ?? EXAMPLES}>
      {children}
    </ExamplesContext.Provider>
  );
}

export function useExamples(): Example[] {
  return useContext(ExamplesContext);
}
