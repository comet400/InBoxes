import { NumberVal, RuntimeVal } from "./values.ts"; // Importing types for numerical and runtime values
import { Stmt } from "../frontend/ast.ts"; // Importing the Stmt type (base node type for AST)
import {
  Program, // Root node of the AST
  BinaryExpression, // Binary operations (e.g., a + b)
  NumLiteral, // Numeric literals (e.g., 42)
  StringLiteral, // String literals (e.g., "hello")
  BooleanLiteral, // Boolean values true/false
  Identifier, // Variable identifiers/names
  ArrayLiteral, // Array literals
  CallExpression, // Function calls
  AssignmentExpression, // Assignment operations (e.g., x = 5)
  BlockStatement, // Code blocks (e.g., { ... })
  IfStatement, // Conditional branching
  WhileStatement, // While loops
  ForStatement, // For loops
  VariableDeclaration, // Variable declarations
  ObjectExpression, // Object literals (e.g., { a: 1, b: 2 })
  FunctionDeclaration, // Function definitions
  ArrayAccess, // Accessing elements in an array
  LogicalExpression, // Logical operations (e.g., AND, OR)
  ComparisonExpression, // Comparisons (e.g., a > b, a === b)
} from "../frontend/ast.ts"; // Importing all AST node types

import Environment from "./environment.ts"; // Importing the Environment class for scoping and variable management

// Importing evaluation functions for various AST node types
import {
  eval_function_declaration,
  eval_program,
  eval_var_declaration,
} from "./eval/statements.ts";

import {
  eval_assignment,
  eval_binary_expr,
  eval_call_expr,
  eval_identifier,
  eval_object_expr,
  eval_array_literal,
  eval_for_statement,
  eval_if_statement,
  eval_while_expr,
  eval_array_access,
  eval_logical_expr,
  eval_comparison_expr,
} from "./eval/expressions.ts";

import { MK_NULL } from "./values.ts"; // Utility function to create a null runtime value

// Main evaluation function that processes AST nodes based on their kind
export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
    switch (astNode.kind) {
        case "NumLiteral": // Handling numeric literals
            return {
                value: (astNode as NumLiteral).value, // Extracting numeric value
                type: "number", // Setting type as number
            } as NumberVal;

        case "StringLiteral": // Handling string literals
            return {
                value: (astNode as StringLiteral).value, // Extracting string value
                type: "string", // Setting type as string
            } as RuntimeVal;

        case "BooleanLiteral": // Handling boolean literals
            return {
                value: (astNode as BooleanLiteral).value, // Extracting boolean value
                type: "boolean", // Setting type as boolean
            } as RuntimeVal;

        case "ArrayLiteral": // Handling array literals
            return eval_array_literal(astNode as ArrayLiteral, env);

        case "Identifier": // Handling variable identifiers
            return eval_identifier(astNode as Identifier, env);

        case "ObjectExpression": // Handling object literals
            return eval_object_expr(astNode as ObjectExpression, env);

        case "CallExpression": // Handling function calls
            return eval_call_expr(astNode as CallExpression, env);

        case "AssignmentExpression": // Handling variable assignments
            return eval_assignment(astNode as AssignmentExpression, env);

        case "LogicalExpression": // Handling logical expressions (e.g., &&, ||)
            return eval_logical_expr(astNode as LogicalExpression, env);

        case "BinaryExpression": // Handling binary operations (e.g., +, -, *)
            return eval_binary_expr(astNode as BinaryExpression, env);

        case "ComparisonExpression": // Handling comparison operations (e.g., >, <, ===)
            return eval_comparison_expr(astNode as ComparisonExpression, env);

        case "IfStatement": // Handling conditional statements
            return eval_if_statement(astNode as IfStatement, env);

        case "WhileStatement": // Handling while loops
            return eval_while_expr(astNode as WhileStatement, env);

        case "ForStatement": // Handling for loops
            return eval_for_statement(astNode as ForStatement, env);

        case "Program": // Handling the root program node
            return eval_program(astNode as Program, env);

        case "VariableDeclaration": // Handling variable declarations
            return eval_var_declaration(astNode as VariableDeclaration, env);

        case "FunctionDeclaration": // Handling function definitions
            return eval_function_declaration(astNode as FunctionDeclaration, env);

        case "ArrayAccess": // Handling array element access
            return eval_array_access(astNode as ArrayAccess, env);

        case "BlockStatement": { // Handling block statements (e.g., { ... })
            let result: RuntimeVal = MK_NULL(); // Default result is null
            for (const stmt of (astNode as BlockStatement).body) { // Loop through each statement in the block
                result = evaluate(stmt, env); // Evaluate each statement
            }
            return result; // Return the result of the last statement
        }

        default: // Handling unsupported AST node kinds
            throw new Error(
                `Unsupported AST Node of kind '${astNode.kind}'. Node details: ${JSON.stringify(astNode)}` // Throwing an error with details
            );
    }
}
