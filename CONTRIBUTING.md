# Contributing to alloy-graphql

Thanks for contributing to `pinterest/alloy-graphql`.

## Project scope

This repository is a standalone GraphQL adapter layer for Alloy. Its main goal is
to preserve behavior parity with the GraphQL implementation from
`alloy-framework/alloy` PR #358 while keeping GraphQL schema emission isolated
from core Alloy packages.

## Development setup

Requirements:

- Node.js 20+
- pnpm 10+

Install and run checks:

```bash
pnpm install
pnpm test
pnpm build
```

## Change expectations

- Keep behavior aligned with the parity goal of this repository.
- Prefer small, focused pull requests.
- Add or update tests for behavior changes.
- Update documentation when public API or usage changes.

## Pull request checklist

- [ ] Tests added/updated as needed
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes
- [ ] README/docs updated if user-facing behavior changed

## Commit messages

Use clear commit messages that explain intent, for example:

- `feat: add relay validation coverage for edge fields`
- `fix: preserve directive handling in input value rendering`
- `docs: clarify schema output contract`
