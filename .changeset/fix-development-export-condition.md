---
"@pinterest/alloy-graphql": patch
---

Remove the `"development"` conditional export entries from `package.json`. When
a consumer's active resolve conditions include both `"development"` and
`"import"` (as Vitest's default conditions do), Node/Vitest picks whichever
condition is declared first in the target package's own `exports` map —
`"development"` was listed first, so it always won and resolved to the raw
`.ts` source files under `dist`'s sibling `src/` directory instead of the
built `dist/src/*.js` output.

That's a problem for any consumer resolving this package from inside their own
`node_modules` (e.g. an app depending on `@pinterest/alloy-graphql` via pnpm):
Node's native TypeScript type-stripping (`--experimental-strip-types`) refuses
to strip types for files located under `node_modules`, by design, so the
resolved raw `.ts` entry point throws at import time:

```
Error: Stripping types is currently unsupported for files under node_modules
```

Removing the `"development"` entries makes `"import"` (which points at
`dist/src/*.js`) the only match, fixing resolution for external consumers.
`pnpm test` (including the in-repo `examples/smoke-consumer` workspace-linked
consumer) still passes after this change, so there's no evidence anything in
this repo relies on the raw-source dev-mode entry point.
