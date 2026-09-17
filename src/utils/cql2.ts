export interface QueryableFilter {
  eq?: string;
  gte?: number;
  lte?: number;
}

export type Cql2Expression =
  | { op: "="; args: [{ property: string }, string] }
  | { op: ">=" | "<="; args: [{ property: string }, number] }
  | { op: "and"; args: Cql2Expression[] };

export function buildCql2Json(
  queryables: Record<string, QueryableFilter>
): Cql2Expression | undefined {
  const clauses: Cql2Expression[] = [];
  for (const [property, filter] of Object.entries(queryables)) {
    if (filter.eq !== undefined) {
      clauses.push({ op: "=", args: [{ property }, filter.eq] });
    }
    if (filter.gte !== undefined) {
      clauses.push({ op: ">=", args: [{ property }, filter.gte] });
    }
    if (filter.lte !== undefined) {
      clauses.push({ op: "<=", args: [{ property }, filter.lte] });
    }
  }
  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return { op: "and", args: clauses };
}
