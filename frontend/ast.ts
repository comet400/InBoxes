export type NodeType =
  | "Program"               // Root node of the AST
  | "Expression"            // Generic expression
  | "BinaryExpression"      // Binary operations (e.g., a + b)
  | "UnaryExpression"       // Unary operations (e.g., -a, !b)
  | "NumLiteral"            // Numeric literals (e.g., 42)
  | "StringLiteral"         // String literals (e.g., "hello")
  | "BooleanLiteral"        // true/false
  | "Identifier"            // Variable names
  | "ArrayLiteral"          // Function definition
  | "CallExpression"        // Function calls
  | "AssignmentExpression"  // Variable assignment (e.g., x = 5)
  | "BlockStatement"        // { ... } blocks of code
  | "IfStatement"           // Conditional branching
  | "WhileStatement"        // Looping construct
  | "ForStatement"          // For loops
  | "ReturnStatement"       // Return from function
  | "VariableDeclaration"   // Variable declaration
  | "ObjectExpression"      // Object literals { a: 1, b: 2 }
  | "Property"              // Property of an object
  | "LogicalExpression"     // Logical AND/OR (e.g., a && b)
  | "ComparisonExpression"  // Comparisons (e.g., a > b)
  | "BreakStatement"        // Break out of a loop
  | "ContinueStatement"     // Skip to the next iteration;
  | "FunctionDeclaration"   // Function definition
  | "ConditionalExpr"       // Conditional expression (e.g., a ? b : c)
  | "IfStatement"           // If statement
  | "End"                   // End statement
  | "FunctionDeclaration"   // Functions statement
  | "ArrayAccess"           // Array access statement

  /** Base interface for expressions */
  export interface Expression {
    kind: NodeType; // Discriminator field for expression types
    symbol?: string; // Name of the variable
    value?: number | string | boolean | null | Expression; // Value of the variable
  }
  
/** Base interface for all AST nodes */
export interface Stmt {
  kind: NodeType;
}

/** Represents the root of the AST */
export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[]; // All top-level statements
}

/** Represents a binary expression (e.g., a + b) */
export interface BinaryExpression extends Expression {
  kind: "BinaryExpression";
  left: Expression;   // Left operand
  right: Expression;  // Right operand
  operator: string;   // Operator (e.g., +, -, *)
}

/** Represents a unary expression (e.g., -a, !b) */
export interface UnaryExpression extends Expression {
  kind: "UnaryExpression";
  operator: string;   // Operator (e.g., -, !)
  argument: Expression; // The operand
}

/** Represents an identifier (variable name) */
export interface Identifier extends Expression {
  kind: "Identifier";
  symbol: string; // Name of the variable
  value: number | string | boolean | null; // Value of the variable
}

/** Represents a numeric literal (e.g., 42) */
export interface NumLiteral extends Expression {
  kind: "NumLiteral";
  value: number; // Numeric value
}

/** Represents a string literal (e.g., "hello") */
export interface StringLiteral extends Expression {
  kind: "StringLiteral";
  value: string; // String value
}

/** Represents a boolean literal (true/false) */
export interface BooleanLiteral extends Expression {
  kind: "BooleanLiteral";
  value: boolean; // Boolean value
}

/** Represents a variable declaration (e.g., let x = [1, 2, 3];) */
export interface VariableDeclaration {
  kind: "VariableDeclaration";
  name: Identifier;
  constant: boolean;
  isArray: boolean;
  initializer: Expression | ArrayLiteral | null | undefined; // Initial value of the variable
  dataType: string | null; // Type of the variable
  value: number | string | boolean | null; // Value of the variable
}


/** Represents a function declaration */
export interface FunctionDeclaration extends Stmt {
  kind: "FunctionDeclaration";
  name: Identifier;       // Function name
  params: Identifier[];   // Function parameters
  body: BlockStatement;   // Function body
}

/** Represents a block of statements { ... } */
export interface BlockStatement extends Stmt {
  kind: "BlockStatement";
  body: Stmt[]; // Statements inside the block
}

/** Represents an if statement */
export interface IfStatement extends Stmt {
  kind: "IfStatement";
  test: Expression;       // Condition expression
  consequent: BlockStatement; // Code to execute if the condition is true
  alternate?: BlockStatement; // Optional else block
}

/** Represents a function call (e.g., print(x)) */
export interface CallExpression extends Expression {
  kind: "CallExpression";
  callee: Expression;     // Function being called
  arguments: Expression[]; // Arguments passed to the function
}

/** Represents an object literal (e.g., { a: 1, b: 2 }) */
export interface ObjectExpression extends Expression {
  kind: "ObjectExpression";
  properties: Property[]; // Properties of the object
}

/** Represents a property in an object (e.g., a: 1) */
export interface Property extends Stmt {
	kind: "Property";
	key: Identifier | StringLiteral | NumLiteral; // Property key must be specific
	value: Expression; // The value can be any valid expression
  }
  

/** Represents an assignment expression (e.g., x = 5) */
export interface AssignmentExpression extends Expression {
  kind: "AssignmentExpression";
  assigne: Expression;   // The left-hand side of the assignment
  value: Expression;     // The right-hand side of the assignment
}

/** Represents a logical expression (e.g., a && b) */
export interface LogicalExpression extends Expression {
  kind: "LogicalExpression";
  left: Expression;   // Left operand
  right: Expression;  // Right operand
  operator: string;   // Logical operator (e.g., &&, ||)
}

/** Represents a comparison expression (e.g., a > b) */
export interface ComparisonExpression extends Expression {
  kind: "ComparisonExpression";
  left: Expression;   // Left operand
  right: Expression;  // Right operand
  operator: string;   // Comparison operator (e.g., >, <, >=, <=)
}

/** Represents a break statement */
export interface BreakStatement extends Stmt {
  kind: "BreakStatement";
}

/** Represents a continue statement */
export interface ContinueStatement extends Stmt {
  kind: "ContinueStatement";
  array: Expression[]; // Elements of the array
}

export interface ArrayLiteral extends Expression {
  kind: "ArrayLiteral";
  elements: Expression[]; // Elements of the array
}

export interface ConditionalExpr extends Expression {
  kind: "ConditionalExpr";
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}

export interface WhileStatement extends Stmt {
  kind: "WhileStatement";
  test: Expression;
  body: BlockStatement;
  condition: Expression;
}

export interface ForStatement extends Stmt {
  kind: "ForStatement";
  loopVar: string;         // Loop variable
  startExpr: Expression;   // Start expression
  endExpr: Expression;     // End expression
  body: Stmt[];            // Loop body
}


export interface ReturnStatement extends Stmt {
  kind: "ReturnStatement";
  argument: Expression | null;
}

export interface FunctionDeclaration extends Stmt {
  kind: "FunctionDeclaration";
  name: Identifier;
  params: Identifier[];
  body: BlockStatement;
}

export interface ArrayAccess extends Expression {
  kind: "ArrayAccess";
  array: Expression;  // Array can be any valid expression, not just an identifier
  index: Expression;  // Index expression
}








