# Don't use **stac-react**

## Context and Problem Statement

Development Seed has headless [STAC](https://stacspec.org) components for [React](https://react.dev/) at [stac-react](https://github.com/developmentseed/stac-react).
**stac-map** needs to fetch STAC values over HTTPS and search STAC APIs, and **stac-react** supports both of these operations.
However, **stac-map** has some additional requirements that are _not_ directly supported by **stac-react**:

- **stac-map** can have _any_ STAC value as it's "root value", not just a STAC API. **stac-react** requires a STAC API for many of its functions.
- **stac-react** does not do any caching of fetched values

## Considered Options

- Extend **stac-react** with the functionality we need for **stac-map**
- Don't use **stac-react**

## Decision Outcome

We decided to not use **stac-react** for the initial build out of **stac-map**.

### Consequences

- We were able to build more quickly because we didn't have to work around limitations of **stac-react**.
- We did a lot of work that might not be as reusable by other STAC+React projects.
  Over the medium-to-long term, we should find parts of **stac-map** that we can move to **stac-react**, and/or refactor **stac-react** to more directly support **stac-map** requirements.
