import { Token, TokenType, tokenize } from "./lexer.ts";
import {
  Program,              // Program AST node
  Stmt,                 // Base interface for all statement nodes
  Expression,           // Base interface for all expression nodes
  VariableDeclaration,  // Variable declaration statement
  AssignmentExpression, // Assignment expression
  IfStatement,          // If statement
  BinaryExpression,     // Binary expression
  Identifier,           // Identifier expression
  NumLiteral,           // Numeric literal expression
  CallExpression,       // Function call expression
  BlockStatement,       // Block statement
  ForStatement,         // For loop statement
  WhileStatement,       // While loop statement
  StringLiteral,        // String literal expression
  FunctionDeclaration,  // Function declaration statement
  ComparisonExpression, // Comparison expression
  LogicalExpression,    // Logical expression
  ArrayAccess,          // Array access expression
  ArrayLiteral,         // Array literal expression
  BooleanLiteral,       // Boolean literal expression
} from "./ast.ts";      // Import all AST nodes from ast.ts

export default class Parser { // Create a new class called Parser to parse the tokens
  private tokens: Token[] = [];
  private position: number = 0;

  public parse(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = { kind: "Program", body: [] };

    while (!this.isEOF()) {
      program.body.push(this.parseStmt());
    }

    return program;
  }

  private parseStmt(): Stmt { // Create a new method called parseStmt to parse statements
    const current = this.peek().type;

    switch (current) {
        case TokenType.Box:
            return this.parseVarDeclaration(); // Parse variable declaration
        case TokenType.Boxes: // Add case for 'boxes'
            return this.parseArrayDeclaration(); // Parse array declaration
        case TokenType.If:
		case TokenType.IfNot:
            return this.parseIfStatement(); // Parse if statement
        case TokenType.For:
            return this.parseForStatement(); // Parse for loop
        case TokenType.While:
		case TokenType.WhileNot:
            return this.parseWhileStatement(); // Parse while loop
        case TokenType.Identifier:
            return this.parseAssignmentOrCall(); // Parse assignment or function call
        case TokenType.Functions:
            return this.parseFunctionDeclaration(); // Parse function declaration
        default:
            throw new Error(`Unexpected token: ${this.peek().value}`);
    }
}

// Helper to parse array declarations
private parseArrayDeclaration(): VariableDeclaration {
    this.consume(TokenType.Boxes, "Expected 'boxes' keyword");
    const name = this.consume(TokenType.Identifier, "Expected array name").value;

    this.consume(TokenType.Equals, "Expected '=' in array declaration");
    const initializer = this.parseArrayLiteral();

    this.consume(TokenType.End, "Expected 'end' after array declaration");

    return {
        kind: "VariableDeclaration",
        name: { kind: "Identifier", symbol: name, value: null },
        initializer,
        constant: false,   // Arrays are mutable by default
        isArray: true,     // Indicate that this is an array
        dataType: "array", // Set data type as 'array'
        value: null,       // Value to be resolved during runtime
    };
}

  

// Helper to parse function calls
  private parseArguments(): Expression[] {
    const args: Expression[] = [];

    while (!this.check(TokenType.EndParameters)) {
      args.push(this.parseExpr());
      if (this.check(TokenType.Comma)) this.advance();
    }

    return args;
  }

  // Helper to parse array access syntax (e.g., lukas[1])
  private parseVarDeclaration(): VariableDeclaration {
    const isBoxes = this.match(TokenType.Boxes); // Check if it's an array declaration
    const keyword = isBoxes ? "boxes" : "box";  

    // Consume the keyword (either 'box' or 'boxes')
    this.consume(isBoxes ? TokenType.Boxes : TokenType.Box, `Expected '${keyword}' keyword`);
    const name = this.consume(TokenType.Identifier, "Expected variable name").value;

    this.consume(TokenType.Equals, `Expected '=' in ${keyword} declaration`);

    let initializer: Expression;

    if (isBoxes) {
        // Parse array initializer
        initializer = this.parseArrayLiteral();
    } else {
        // Parse normal variable initializer
        initializer = this.parseExpr();
    }

    this.consume(TokenType.End, `Expected 'end' after ${keyword} declaration`);

    return {
        kind: "VariableDeclaration",
        name: { kind: "Identifier", symbol: name, value: null },
        initializer,
        constant: false,
        isArray: isBoxes,
        dataType: isBoxes ? "array" : "unknown",
        value: null,
    };
}

// Helper to parse array literals
private parseArrayLiteral(): ArrayLiteral {
    this.consume(TokenType.OpenArray, "Expected '[' to start array literal");
    const elements: Expression[] = [];

    while (!this.check(TokenType.CloseArray)) {
        elements.push(this.parseExpr());

        // Support both comma and space as separators
        if (this.check(TokenType.Comma)) {
            this.advance(); // Skip commas
        } else if (!this.check(TokenType.CloseArray)) {
            // Skip spaces without explicit commas
            this.advance();
        }
    }

    this.consume(TokenType.CloseArray, "Expected ']' to end array literal");

    return {
        kind: "ArrayLiteral",
        elements,
    };
}

// Helper to parse array literals
private parseArrayElements(): Expression[] {
    const elements: Expression[] = [];
    while (!this.check(TokenType.End)) {
        elements.push(this.parseExpr());
        if (this.check(TokenType.Comma)) this.advance();
    }
    return elements;
}

// Helper to parse logical expressions
private parseLogicalExpr(): Expression {
    let left = this.parseComparisonExpr();

    // Handle logical operators (`and` and `or`)
    while (this.match(TokenType.And, TokenType.Or)) {
        const operator = this.previous().value; // Capture the operator
        const right = this.parseComparisonExpr(); // Parse the right-hand side
        left = {
            kind: "LogicalExpression",
            left,
            right,
            operator, // Use `and` or `or` as the operator
        } as LogicalExpression;
    }

    return left;
}

// Helper to parse comparison expressions
  private parseComparisonExpr(): Expression {
    let left = this.parsePrimaryExpr();

    while (
      this.match(
        TokenType.EqualsEquals,
        TokenType.NotEquals,
        TokenType.LessThan,
        TokenType.LessThanOrEquals,
        TokenType.GreaterThan,
        TokenType.GreaterThanOrEquals
      )
    ) {
      const operator = this.previous().value;
      const right = this.parsePrimaryExpr();
      left = {
        kind: "ComparisonExpression",
        left,
        right,
        operator,
      } as ComparisonExpression;
    }

    return left;
  }

  // Helper to parse if statements
  private parseIfStatement(): IfStatement {
    const isNegated = this.match(TokenType.IfNot); // Check if `ifNot` is used
    if (!isNegated) {
        this.consume(TokenType.If, "Expected 'if' or 'ifNot' keyword");
    }

    let test = this.parseLogicalExpr();

    if (isNegated) {
        // Negate the condition
        test = {
            kind: "LogicalExpression",
            operator: "not",
            left: test,
        } as LogicalExpression;
    }

    this.consume(TokenType.DoIt, "Expected 'doIt' after condition");

    const consequent: BlockStatement = { kind: "BlockStatement", body: [] };

    while (!this.check(TokenType.End)) {
        consequent.body.push(this.parseStmt());
    }

    this.consume(TokenType.End, "Expected 'end' to close 'if' statement");

    return { kind: "IfStatement", test, consequent };
}



  private parseForStatement(): ForStatement {
    this.consume(TokenType.For, "Expected 'for' keyword");
    const loopVar = this.consume(TokenType.Identifier, "Expected loop variable").value;

    this.consume(TokenType.Equals, "Expected '=' after loop variable");
    const startExpr = this.parseExpr();

    this.consume(TokenType.To, "Expected 'to' keyword");
    const endExpr = this.parseExpr();

    this.consume(TokenType.DoIt, "Expected 'doIt' keyword");

    const body: Stmt[] = [];
    while (!this.check(TokenType.End)) {
      body.push(this.parseStmt());
    }

    this.consume(TokenType.End, "Expected 'end' to close 'for' loop");

    return {
      kind: "ForStatement",
      loopVar,
      startExpr,
      endExpr,
      body,
    } as ForStatement;
  }

  private parseWhileStatement(): WhileStatement {
    const isNegated = this.match(TokenType.WhileNot); // Check for `whileNot` token
    if (!isNegated) {
        this.consume(TokenType.While, "Expected 'while' or 'whileNot' keyword");
    }

    let test = this.parseLogicalExpr();

    if (isNegated) {
        // Wrap the test in a logical NOT expression
        test = {
            kind: "LogicalExpression",
            operator: "not",
            left: test, // Original condition becomes the operand of NOT
        } as LogicalExpression;
    }

    this.consume(TokenType.DoIt, "Expected 'doIt' after while condition");

    const body: BlockStatement = { kind: "BlockStatement", body: [] };

    while (!this.check(TokenType.End)) {
        body.body.push(this.parseStmt());
    }

    this.consume(TokenType.End, "Expected 'end' to close 'while' statement");

    return { kind: "WhileStatement", test, body, condition: test };
}


  private parseAssignmentOrCall(): Stmt {
    const identifier = this.consume(TokenType.Identifier, "Expected identifier").value;

    // Check if this is an array element assignment (e.g., array[1] = 10 end)
    if (this.check(TokenType.OpenArray)) {
        const arrayAccess = this.parseArrayAccess(identifier);
        this.consume(TokenType.Equals, "Expected '=' after array access");
        const value = this.parseExpr();
        this.consume(TokenType.End, "Expected 'end' after array element assignment");

        return {
            kind: "AssignmentExpression",
            assigne: arrayAccess, // Treat array access as the left-hand side
            value,
        } as AssignmentExpression;
    }

    // Handle variable assignment
    if (this.match(TokenType.Equals)) {
        const value = this.parseExpr();
        this.consume(TokenType.End, "Expected 'end' after assignment");
        return {
            kind: "AssignmentExpression",
            assigne: { kind: "Identifier", symbol: identifier },
            value,
        } as AssignmentExpression;
    }

    // Handle function calls
    if (this.match(TokenType.BeginParameters)) {
        const args = this.parseArguments();
        this.consume(TokenType.EndParameters, "Expected ')' after function arguments");
        return {
            kind: "CallExpression",
            callee: { kind: "Identifier", symbol: identifier },
            arguments: args,
        } as CallExpression;
    }

    throw new Error(`Unexpected token after identifier: ${this.peek().value}`);
}


  private parseExpr(): Expression {
    return this.parseBinaryExpr(); // Parse binary expressions
}

private parseBinaryExpr(): Expression {
    let left = this.parsePrimaryExpr(); // Parse the left-hand side of the expression

    // Handle binary operators
    while (
        this.match(
            TokenType.Plus,
            TokenType.Minus,
            TokenType.Multiply,
            TokenType.Divide,
            TokenType.LessThan,
            TokenType.GreaterThan,
            TokenType.EqualsEquals,
            TokenType.NotEquals
        )
    ) {
        const operator = this.previous().value; // Store the operator
        const right = this.parsePrimaryExpr(); // Parse the right-hand side
        left = {
            kind: "BinaryExpression",
            left,
            right,
            operator,
        } as BinaryExpression;
    }

    return left;
}


private parsePrimaryExpr(): Expression {
    const current = this.peek();

    switch (current.type) {
        case TokenType.Identifier: {
            const identifier = this.advance().value;

            // Check if this is an array access (e.g., lukas[1])
            if (this.check(TokenType.OpenArray)) {
                return this.parseArrayAccess(identifier);
            }

            return { kind: "Identifier", symbol: identifier } as Identifier;
        }
        case TokenType.Number:
            return { kind: "NumLiteral", value: parseFloat(this.advance().value) } as NumLiteral;
        case TokenType.String:
            return { kind: "StringLiteral", value: this.advance().value } as StringLiteral;
        case TokenType.BooleanLiteral:
            return { kind: "BooleanLiteral", value: this.advance().value === "true" } as BooleanLiteral; // Handle boolean
        default:
            throw new Error(`Unexpected token in expression: ${current.value}`);
    }
}



// Parse array access syntax (e.g., lukas[1])
private parseArrayAccess(arrayName: string): ArrayAccess {
    this.consume(TokenType.OpenArray, "Expected '[' for array access");
    const indexExpr = this.parseExpr(); // Parse the index inside the brackets
    this.consume(TokenType.CloseArray, "Expected ']' after array index");

    return {
        kind: "ArrayAccess",
        array: { kind: "Identifier", symbol: arrayName } as Identifier, // Treat arrayName as an Identifier
        index: indexExpr,
    };
}



  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isEOF()) return false;
    return this.peek().type === type;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(message);
  }

  private peek(): Token {
    return this.tokens[this.position];
  }

  private previous(): Token {
    return this.tokens[this.position - 1];
  }

  private advance(): Token {
    if (!this.isEOF()) this.position++;
    return this.tokens[this.position - 1];
  }

  private isEOF(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  // Helper to parse function declarations
  private parseFunctionDeclaration(): FunctionDeclaration {
    this.consume(TokenType.Functions, "Expected 'function' keyword"); 

    const name = this.consume(TokenType.Identifier, "Expected function name").value; 

    this.consume(TokenType.BeginParameters, "Expected '(' after function name");
    const params: Identifier[] = [];
    while (!this.check(TokenType.EndParameters)) {
      const param = this.consume(TokenType.Identifier, "Expected parameter name").value;
      params.push({ kind: "Identifier", symbol: param, value: null });
      if (this.check(TokenType.Comma)) this.advance();
    }
    this.consume(TokenType.EndParameters, "Expected ')' after function parameters");

    this.consume(TokenType.DoIt, "Expected 'doIt' after function signature");

    const body: BlockStatement = { kind: "BlockStatement", body: [] };
    while (!this.check(TokenType.End)) {
      body.body.push(this.parseStmt());
    }

    this.consume(TokenType.End, "Expected 'end' to close the function body");

    return {
      kind: "FunctionDeclaration",
      name: { kind: "Identifier", symbol: name, value: null },
      params,
      body,
    };
  }
}
