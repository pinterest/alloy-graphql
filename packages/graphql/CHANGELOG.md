# @pinterest/alloy-graphql

## 1.1.1

### Patch Changes

- 7c80243: Add an optional `valueNode` prop to `<Argument>` for directive arguments.

  `buildAppliedDirectiveNodes` builds each directive argument's AST via
  `astFromValue(arg.value, argDef.type)`. For an argument typed as a custom
  scalar, `astFromValue` calls the scalar's `serialize()` and can only turn the
  result into an AST node for primitive values; a serialized value that's an
  object or another non-primitive structure makes `astFromValue` throw
  (`Cannot convert value to AST: ...`), even though that shape is exactly what
  a custom scalar is for.

  `<Argument>` now accepts an optional `valueNode: ConstValueNode`. When
  supplied, it's used verbatim as the argument's AST value, bypassing
  `astFromValue` entirely — letting callers hand-construct whatever AST shape
  their custom scalar actually needs (e.g. an `ObjectValueNode` for a JSON-like
  scalar). `value` is now optional on `ArgumentProps` since a `valueNode`-only
  usage has no meaningful `value` to coerce. Existing usage (`value` only, no
  `valueNode`) is unaffected.

- 41d7467: Remove the `"development"` conditional export entries from `package.json`. When
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

## 1.1.0

### Minor Changes

- 86679c7: Initial standalone release of the GraphQL adapter extracted from the Alloy GraphQL implementation.

  This package provides GraphQL schema authoring via Alloy-style components and emits `GraphQLSchema` using `graphql-js`, while keeping this behavior isolated from core Alloy packages.

### Patch Changes

- Upgrade to @alloy-js/core 0.24.x for compatibility with latest TypeSpec emitter-framework.
