---
"@pinterest/alloy-graphql": minor
---

Add an optional `valueNode` prop to `<Argument>` for directive arguments.

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
