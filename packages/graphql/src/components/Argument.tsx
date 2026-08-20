import type { Children } from "@alloy-js/core";
import type { ConstValueNode } from "graphql";
import { useDirectiveArgTargetContext } from "../schema.js";

export interface ArgumentProps {
  name: string;
  value?: unknown;
  /**
   * Pre-built graphql-js value AST used verbatim during schema build,
   * bypassing `astFromValue`. For directive args whose value is an arbitrary
   * structure inside a custom scalar.
   */
  valueNode?: ConstValueNode;
}

/**
 * Adds an argument to the nearest `Directive` application.
 *
 * @example Directive argument
 * ```tsx
 * <Directive name="auth">
 *   <Argument name="role" value="admin" />
 * </Directive>
 * ```
 *
 * @remarks
 * This component must be used within a `Directive`.
 */
export function Argument(props: ArgumentProps): Children {
  const target = useDirectiveArgTargetContext();
  if (target.argNames.has(props.name)) {
    throw new Error(`Directive argument "${props.name}" is already defined.`);
  }
  if (props.value !== undefined && props.valueNode !== undefined) {
    throw new Error(
      `Argument "${props.name}" received both "value" and "valueNode"; provide only one.`,
    );
  }
  target.argNames.add(props.name);
  target.args.push({
    name: props.name,
    value: props.value,
    valueNode: props.valueNode,
  });
  return undefined;
}
