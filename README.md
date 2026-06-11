# alloy-graphql

Standalone GraphQL adapter layer for Alloy, published as `pinterest/alloy-graphql`.

This repository isolates GraphQL schema emission so core Alloy usage can continue
to focus on JSX element emission patterns.

## Why this exists

- Core Alloy maintainers want core packages to keep JSX-oriented emitter patterns.
- GraphQL bindings emit `GraphQLSchema` (from `graphql-js`), which is a different
  output model and better maintained as an optional outer layer.
- This repository extracts and maintains that GraphQL layer independently.

## Source of truth for behavior

The implementation and emitted output are intentionally aligned with
[`alloy-framework/alloy` PR #358](https://github.com/alloy-framework/alloy/pull/358).
For identical component inputs, this project should emit equivalent schema output
and validation behavior.

## Repository layout

- `packages/graphql`: standalone GraphQL package (`@pinterest/alloy-graphql`)

## Development

```bash
pnpm install
pnpm test
pnpm build
```

## Release workflow

This repo uses Changesets for versioning and publishing.

```bash
pnpm changeset          # create a release note/version bump entry
pnpm version-packages   # apply versions and changelog updates
pnpm release            # publish packages
```

## Community docs

- Contributing guide: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- Security policy: `SECURITY.md`
- Support guide: `SUPPORT.md`
