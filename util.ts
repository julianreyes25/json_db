import { red, yellow } from "https://deno.land/std@0.201.0/fmt/colors.ts";

/***
 * Creates a new Error
 */
function error(msg: string, name?: string) {
  console.log(red(`[${name ? name : "ERROR"}]`), msg);
  Deno.exit(1);
}
/***
 * Creates a new Warn
 */
function warn(msg: string, name?: string) {
  console.log(yellow(`[${name ? name : "WARN"}]`), msg);
}
/***
 * A fixed `typeof` function\
 * Examples:
 * ```ts
 * typeOf([]) // "array"
 * typeOf(null) // "null"
 * typeOf({}.x) // "undefined"
 * ```
 */
function typeOf(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}
/***
 * The parsers used for the type checking of the schema
 */
const parsers = {
  expected: (expectedType: ReturnType<typeof typeOf>, value: unknown) => {
    if (typeOf(value) !== expectedType) {
      error(
        `Expected "${expectedType}", but got "${typeOf(value)}"`,
        "TypeError",
      );
    }
    return value;
  },
  string: (value: unknown) => parsers.expected("string", value),
  number: (value: unknown) => parsers.expected("number", value),
  object: (value: unknown) => parsers.expected("object", value),
  array: (value: unknown) => parsers.expected("array", value),
  any: (value: unknown) => {
    warn("You are using the SchemaType any", "TypeWarn");
    return value;
  },
};

export { error, parsers, typeOf, warn };