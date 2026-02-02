# Drill the props

> [!NOTE]
> This ADR is out-of-date as of v1.0.0, when we switched to [zustand](https://zustand.docs.pmnd.rs/) for state management.

## Context and Problem Statement

There's a lot of state that we need to synchronize between the map and the rest of the application.

## Considered Options

- Use a custom context and provider
- Use dispatch
- Use a state management framework
- Just [prop drill](https://react.dev/learn/passing-data-deeply-with-context#the-problem-with-passing-props)

## Decision Outcome

We tried both dispatch and a custom context, and while both were fine, they felt complicated to manage as the app changed state.
We rejected a state management framework as "too heavy" for this simple of an app.
As of v0.7, we went back to prop drilling.

### Consequences

- Good, because it encourages us to have a flatter, simpler component hierarchy
- Bad, because it leads to components with _lots_ of props at a high level
