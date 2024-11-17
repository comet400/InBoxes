import Environment from "./environment.ts"; // Importing the Environment class to manage variable scoping and runtime environments
import { Stmt } from "../frontend/ast.ts"; // Importing the base type for abstract syntax tree (AST) nodes
import { Identifier } from '../frontend/ast.ts'; // Importing the Identifier node type from the AST

// Defining the possible types of runtime values
export type ValueType =
  | "null" // Null type
  | "number" // Numeric type
  | "boolean" // Boolean type
  | "object" // Object type
  | "array" // Array type
  | "native-fn" // Native function type (e.g., JavaScript functions)
  | "function" // Custom function type
  | "string"; // String type

// Interface defining the structure of a runtime value
export interface RuntimeVal {
  type: ValueType; // The type of the value
  value?: null | number | boolean | Map<string, RuntimeVal> | RuntimeVal[] | FunctionCall | string | undefined | ValueType; // Possible value options
  params?: Identifier[]; // Optional list of function parameters (if the value is a function)
  body?: Stmt[]; // Optional function body (if the value is a function)
  env: Environment; // The environment associated with the runtime value
}

/**
 * Defines a runtime value of type null
 */
export interface NullVal extends RuntimeVal {
  type: "null"; // Null type
  value: null; // The value is always null
}

// Factory function to create a null runtime value
export function MK_NULL() {
  return { type: "null", value: null } as NullVal; // Returns a NullVal instance
}

// Interface defining the structure of a boolean runtime value
export interface BooleanVal extends RuntimeVal {
  type: "boolean"; // Boolean type
  value: boolean; // Boolean value
}

// Factory function to create a boolean runtime value
export function MK_BOOL(b = true) {
  return { type: "boolean", value: b } as BooleanVal; // Returns a BooleanVal instance
}

/**
 * Defines a runtime value that represents a native JavaScript number.
 */
export interface NumberVal extends RuntimeVal {
  type: "number"; // Number type
  value: number; // Numeric value
}

// Factory function to create a number runtime value
export function MK_NUMBER(n = 0) {
  return { type: "number", value: n } as NumberVal; // Returns a NumberVal instance
}

/**
 * Defines a runtime value that represents an object.
 */
export interface ObjectVal extends RuntimeVal {
  type: "object"; // Object type
  properties: Map<string, RuntimeVal>; // Object properties stored as key-value pairs
}

/**
 * Defines a runtime value that represents an array.
 */
export interface ArrayVal extends RuntimeVal {
  type: "array"; // Array type
  elements: RuntimeVal[]; // Array elements, which are of type RuntimeVal
}

// Factory function to create an array runtime value
export function MK_ARRAY(elements: RuntimeVal[] = []) {
  return { type: "array", elements } as ArrayVal; // Returns an ArrayVal instance
}

// Type definition for a function call, which takes arguments and an environment and returns a runtime value
export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;

// Interface defining the structure of a native function runtime value
export interface NativeFnValue extends RuntimeVal {
  type: "native-fn"; // Native function type
  call: FunctionCall; // The function call implementation
}

// Factory function to create a native function runtime value
export function MK_NATIVE_FN(call: FunctionCall) {
  return { type: "native-fn", call } as NativeFnValue; // Returns a NativeFnValue instance
}

// Interface defining the structure of a custom function runtime value
export interface FunctionValue extends RuntimeVal {
  type: "function"; // Function type
  name: string; // Name of the function
  parameters: string[]; // Function parameters
  declarationEnv: Environment; // The environment in which the function was declared
  body: Stmt[]; // The function body as a list of statements
}
