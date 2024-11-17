
export enum TokenType {
	// Operators
	Plus,                // Represents the '+' operator 
	Minus,               // Represents the '-' operator 
	Multiply,            // Represents the '*' operator 
	Divide,              // Represents the '/' operator 
	Equals,              // Represents the '=' operator 
	LessThan,            // Represents the '<' operator 
	LessThanOrEquals,    // Represents the '<=' operator 
    EqualsEquals,       // Represents the '==' operator
	GreaterThan,         // Represents the '>' operator 
	GreaterThanOrEquals, // Represents the '>=' operator 
	StringC,             // Represents the '"' token 
	NotEquals,           // Represents the '!' token
	OpenArray,           // Represents the '[' token
	CloseArray,          // Represents the ']' token
    To,                 // Represents the 'to' token

	// Block Tokens
	BeginBlock,       // Represents the '{' token
	EndBlock,         // Represents the '}' token

	// Function Parameter Tokens
	BeginParameters,  // Represents the '(' token
	EndParameters,    // Represents the ')' token

    Comment,          // Represents the '#' token
    MultiComment,     // Represents the '/*' token

	// Keywords
	Box,              // Represents the 'box' keyword
	NoChange,         // Represents the 'noChange' keyword
	DoIt,             // Represents the 'doIt' keyword
	End,              // Represents the 'end' keyword
	Comma,            // Represents the ',' token
	Boxes,			  // Represents the 'boxes' keyword
	Not,			  // Represents the 'not' keyword
	And,			  // Represents the 'and' keyword
	Or,				  // Represents the 'or' keyword
	Return,			  // Represents the 'return' keyword
    If,				  // Represents the 'if' keyword
    Else,			  // Represents the 'else' keyword
    While,			  // Represents the 'while' keyword
    WhileNot,		  // Represents the 'whileNot' keyword
    For,			  // Represents the 'for' keyword
    Functions,		  // Represents the 'functions' keyword
    IfNot,			  // Represents the 'ifNot' keyword

	// Literals
	Number,           // Represents numeric literals (e.g., 42)
	String,           // Represents string literals (e.g., "hello")
	BooleanLiteral,   // Represents boolean literals (true/false)

	// General Tokens
	Identifier,       // Represents variable/function names
	EOF               // End of input
}

  
  
const MyKEYWORDS: Record<string, TokenType> = {
	box: TokenType.Box,
	boxes: TokenType.Boxes,
	noChange: TokenType.NoChange,
	doIt: TokenType.DoIt,
	end: TokenType.End,
	true: TokenType.BooleanLiteral,
	false: TokenType.BooleanLiteral,
	equal: TokenType.Equals,
	notEqual: TokenType.NotEquals,
	lessThan: TokenType.LessThan,
	lessThanOrEquals: TokenType.LessThanOrEquals,
	greaterThan: TokenType.GreaterThan,
	greaterThanOrEquals: TokenType.GreaterThanOrEquals,
    is : TokenType.EqualsEquals,
	and: TokenType.And,
	or: TokenType.Or,
    if: TokenType.If,
    else: TokenType.Else,
    while: TokenType.While,
    for: TokenType.For,
    return: TokenType.Return,
    to: TokenType.To,
    function: TokenType.Functions,
    add: TokenType.Plus,
    subtract: TokenType.Minus,
    multiply: TokenType.Multiply,
    divide: TokenType.Divide,
    equals: TokenType.EqualsEquals,
    ifNot: TokenType.IfNot,
    whileNot: TokenType.WhileNot,
  };
  
  

  
  export interface Token {
	value: string;
	type: TokenType;
  }
  
  function token(value = "", type: TokenType): Token {
	return { value, type };
  }
  
  const validOperators = new Map<string, TokenType>([
	["+", TokenType.Plus],
	["-", TokenType.Minus],
	["*", TokenType.Multiply],
	["/", TokenType.Divide],
	["=", TokenType.Equals],
	["\"", TokenType.StringC],
	[",", TokenType.Comma],
	["!", TokenType.NotEquals],
	["[", TokenType.OpenArray],
	["]", TokenType.CloseArray],
	["<", TokenType.LessThan],
	["<=", TokenType.LessThanOrEquals],
	[">", TokenType.GreaterThan],
	[">=", TokenType.GreaterThanOrEquals],
    ["==", TokenType.EqualsEquals], // Add support for `==`
	["{", TokenType.BeginBlock],
	["}", TokenType.EndBlock],
	["(", TokenType.BeginParameters],
	[")", TokenType.EndParameters],
    [";", TokenType.End],
  ]);
  
  function isAlpha(src: string): boolean {
	return /^[a-zA-Z]$/.test(src); // Check if the character is a letter
  }
  
  function isDigit(src: string): boolean {
	return /^[0-9]$/.test(src); // Check if the character is a digit
  }
  
  function skipChar(src: string): boolean {
	return /^\s$/.test(src); // Check if the character is a whitespace
  }
  
  export function tokenize(sourceCode: string): Token[] { // Tokenize the source code
    const tokens: Token[] = [];
    let position = 0;
    let line = 1;
    let column = 0;

    const advance = () => { // Helper function to advance the position
        if (sourceCode[position] === "\n") { // Check if the current character is a newline
            line++;
            column = 0;
        } else {
            column++;
        }
        position++;
    };
    // Iterate through the source code
    while (position < sourceCode.length) {
        const char = sourceCode[position];

        // Handle single-line comments
        if (char === "#") {
            while (position < sourceCode.length && sourceCode[position] !== "\n") {
                advance();
            }
            continue; // Skip the comment
        }

        // Handle multi-line comments
        if (char === "/" && sourceCode[position + 1] === "*") {
            advance(); // Consume '/'
            advance(); // Consume '*'
            while (position < sourceCode.length && !(sourceCode[position] === "*" && sourceCode[position + 1] === "/")) {
                if (sourceCode[position] === "\n") {
                    line++;
                    column = 0;
                }
                advance();
            }
            if (position >= sourceCode.length || sourceCode[position] !== "*" || sourceCode[position + 1] !== "/") {
                throw new Error(`Unterminated multi-line comment at line ${line}`);
            }
            advance(); // Consume '*'
            advance(); // Consume '/'
            continue; // Skip the comment
        }

        if (char === "\"") {
            let string = "";
            const startLine = line;
            const startColumn = column;
            advance(); // Skip the opening quote

            while (position < sourceCode.length && sourceCode[position] !== "\"") {
                if (sourceCode[position] === "\\") {
                    advance(); // Handle escape sequences
                    if (position >= sourceCode.length) {
                        throw new Error(
                            `Unterminated string literal at line ${startLine}, column ${startColumn}`
                        );
                    }
                    const escapeChar = sourceCode[position];
                    switch (escapeChar) { // Handle escape characters
                        case "n":
                            string += "\n";
                            break;
                        case "t":
                            string += "\t";
                            break;
                        case "\"":
                            string += "\"";
                            break;
                        case "\\":
                            string += "\\";
                            break;
                        default:
                            throw new Error(
                                `Invalid escape sequence '\\${escapeChar}' at line ${line}, column ${column}`
                            );
                    }
                } else {
                    string += sourceCode[position];
                }
                advance();
            }

            if (position >= sourceCode.length || sourceCode[position] !== "\"") {
                throw new Error(
                    `Unterminated string literal at line ${startLine}, column ${startColumn}` // Handle unterminated strings
                );
            }
            advance(); // Skip the closing quote
            tokens.push(token(string, TokenType.String));
        }

        else if (sourceCode.slice(position, position + 2) === "==") {
            tokens.push(token("==", TokenType.EqualsEquals)); // Add the '==' token
            position += 2; // Advance by 2 characters
        } 
        else if (validOperators.has(char)) { // Handle operators
            tokens.push(token(char, validOperators.get(char)!)); // Add the operator token
            advance();
        }
        
        // Handle numbers (including floats)
        else if (isDigit(char)) {
            let number = "";
            let hasDecimal = false;

            while (
                position < sourceCode.length &&
                (isDigit(sourceCode[position]) || sourceCode[position] === ".") // Handle numbers
            ) {
                if (sourceCode[position] === ".") {
                    if (hasDecimal) {
                        throw new Error(
                            `Invalid number: multiple decimals at line ${line}, column ${column}`
                        );
                    }
                    hasDecimal = true;
                }
                number += sourceCode[position]; // Add the number
                advance(); // Advance the position
            }

            if (number === ".") {
                throw new Error(
                    `Invalid number: standalone '.' at line ${line}, column ${column}`
                );
            }
            tokens.push(token(number, TokenType.Number));
        }

        // Handle identifiers and keywords
        else if (isAlpha(char)) {
            let identifier = "";
            while (
                position < sourceCode.length &&
                (isAlpha(sourceCode[position]) || isDigit(sourceCode[position]))
            ) {
                identifier += sourceCode[position];
                advance();
            }

            // Check if the identifier is a keyword
            const keyword = MyKEYWORDS[identifier];
            if (keyword !== undefined) {
                tokens.push(token(identifier, keyword));
            } else {
                tokens.push(token(identifier, TokenType.Identifier));
            }
        }
        // Skip whitespace
        else if (skipChar(char)) {
            advance();
        }
        // Unexpected characters
        else {
            throw new Error(
                `Unexpected character '${char}' at line ${line}, column ${column}`
            );
        }
    }

    tokens.push(token("", TokenType.EOF)); // End of input token
    return tokens; // Return the tokens
}





  
  


  
  