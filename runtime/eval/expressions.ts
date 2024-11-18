import {
	AssignmentExpression,
	BinaryExpression,
	CallExpression,
	Identifier,
	ObjectExpression,
	ArrayLiteral,
	ConditionalExpr,
	WhileStatement,
	IfStatement,
	ForStatement,
	FunctionDeclaration,
	ArrayAccess,
	LogicalExpression,
	ComparisonExpression,
} from "../../frontend/ast.ts";

import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import {
	FunctionValue,
	MK_NULL,
	NativeFnValue,
	NumberVal,
	ObjectVal,
	RuntimeVal,
	ArrayVal,
} from "../values.ts";

/**
 * Evaluates binary expressions, supporting numeric, logical, and comparison operations.
 */
export function eval_binary_expr(
    binop: BinaryExpression,
    env: Environment
): RuntimeVal {
    const lhs = evaluate(binop.left, env);
    const rhs = evaluate(binop.right, env);

    // Handle boolean logic
    if (lhs.type === "boolean" && rhs.type === "boolean") {
        switch (binop.operator) {
            case "and":
                return { type: "boolean", value: Boolean(lhs.value) && Boolean(rhs.value), env };
            case "or":
                return { type: "boolean", value: Boolean(lhs.value) || Boolean(rhs.value), env };
            default:
                throw new Error(`Unsupported operator '${binop.operator}' for boolean operands.`);
        }
    }

    // Handle comparisons
    if (binop.operator === "==" || binop.operator === "!=") {
        return {
            type: "boolean",
            value: binop.operator === "=="
                ? lhs.value === rhs.value
                : lhs.value !== rhs.value,
            env
        };
    }

    // Handle numeric operations and comparisons
    if (lhs.type === "number" && rhs.type === "number") {
        switch (binop.operator) {
            case "+":
            case "add":
                return { type: "number", value: (lhs.value as number) + (rhs.value as number), env };
            case "-":
            case "subtract":
                return { type: "number", value: (lhs.value as number) - (rhs.value as number), env };
            case "*":
            case "multiply":
                return { type: "number", value: (lhs.value as number) * (rhs.value as number), env };
            case "/":
            case "divide":
                if (rhs.value === 0) throw new Error("Division by zero.");
                return { type: "number", value: (lhs.value as number) / (rhs.value as number), env };
            case "<":
            case "lessThan":
                return { type: "boolean", value: (lhs.value as number) < (rhs.value as number), env };
            case ">":
            case "greaterThan":
                return { type: "boolean", value: (lhs.value as number) > (rhs.value as number), env };
            case "<=":
            case "lessThanOrEqual":
                return { type: "boolean", value: (lhs.value as number) <= (rhs.value as number), env };
            case ">=":
            case "greaterThanOrEqual":
                return { type: "boolean", value: (lhs.value as number) >= (rhs.value as number), env };
            default:
                throw new Error(`Unsupported operator '${binop.operator}' in numeric binary expression.`);
        }
    }

    // Error for unsupported types
    throw new Error(
        `Binary operation '${binop.operator}' not supported for operand types '${lhs.type}' and '${rhs.type}'.`
    );
}

// Evaluate an identifier expression
export function eval_identifier(
	ident: Identifier,
	env: Environment
): RuntimeVal {
	return env.lookupVar(ident.symbol);
}

// Evaluate an assignment expression
export function eval_assignment(expr: AssignmentExpression, env: Environment): RuntimeVal {
    // Check if the left-hand side is an array access
    if (expr.assigne.kind === "ArrayAccess") {
        const arrayAccess = expr.assigne as ArrayAccess;
        const array = evaluate(arrayAccess.array, env); // Evaluate the array
        const index = evaluate(arrayAccess.index, env); // Evaluate the index

        if (array.type !== "array") {
            throw new Error(`Cannot assign to non-array type.`);
        }
        if (index.type !== "number") {
            throw new Error(`Array index must be a number.`);
        }

        const arrayVal = array as ArrayVal;
        const idx = index.value as number;

        // Validate the index
        if (idx < 0 || idx >= arrayVal.elements.length) {
            throw new Error(`Array index out of bounds.`);
        }

        // Update the array element
        const newValue = evaluate(expr.value, env);
        arrayVal.elements[idx] = newValue;

        return newValue;
    }

    // Handle normal variable assignment
    const value = evaluate(expr.value, env);
    env.assignVar((expr.assigne as Identifier).symbol, value);
    return value;
}

// Evaluate an object expression
export function eval_object_expr(
	obj: ObjectExpression,
	env: Environment
): RuntimeVal {
	const object = { type: "object", properties: new Map() } as ObjectVal;
	for (const { key, value } of obj.properties) {
		const runtimeVal = value
			? evaluate(value, env)
			: env.lookupVar((key as Identifier).symbol); // Fallback to lookup for shorthand properties

		const keyName = (key as Identifier).symbol;
		object.properties.set(keyName, runtimeVal);
	}

	return object;
}

// Evaluate an array literal
export function eval_array_literal(
	arr: ArrayLiteral,
	env: Environment
): RuntimeVal {
	const elements = arr.elements.map((element) => evaluate(element, env));
	return { type: "array", elements } as ArrayVal;
}

// Evaluate a conditional expression
export function eval_conditional_expr(
	cond: ConditionalExpr,
	env: Environment
): RuntimeVal {
	const test = evaluate(cond.test, env);
	if (test.type !== "boolean") {
		throw "Condition must evaluate to a boolean.";
	}

	if (test.value) {
		return evaluate(cond.consequent, env);
	} else if (cond.alternate) {
		return evaluate(cond.alternate, env);
	}

	return MK_NULL();
}

// Evaluate a while loop
export function eval_while_expr(loop: WhileStatement, env: Environment): RuntimeVal {
	while (true) {
		const condition = evaluate(loop.condition, env);
		if (condition.type !== "boolean" || !condition.value) {
			break;
		}

		for (const stmt of loop.body.body) {
			evaluate(stmt, env);
		}
	}

	return MK_NULL();
}


// Evaluate a call expression
export function eval_call_expr(expr: CallExpression, env: Environment): RuntimeVal {
	const args = expr.arguments.map((arg) => evaluate(arg, env));
	const fn = evaluate(expr.callee, env);

	if (fn.type === "native-fn") {
		return (fn as NativeFnValue).call(args, env);
	}

	if (fn.type === "function") {
		const func = fn as FunctionValue;
		const scope = new Environment(func.declarationEnv);

		// Create variables for the function parameters
		for (let i = 0; i < func.parameters.length; i++) {
			const paramName = func.parameters[i];
			scope.declareVar(paramName, args[i] || MK_NULL(), false);
		}

		let result: RuntimeVal = MK_NULL();
		for (const stmt of func.body) {
			result = evaluate(stmt, scope);
		}

		return result;
	}

	throw "Cannot call a value that is not a function: " + JSON.stringify(fn);
}

// Evaluate an if statement
export function eval_if_statement(stmt: IfStatement, env: Environment): RuntimeVal {
    const condition = evaluate(stmt.test, env);
    if (condition.value) {
        return evaluate(stmt.consequent, env);
    } else if (stmt.alternate) {
        return evaluate(stmt.alternate, env);
    }
    return MK_NULL();
}

// Evaluate a for loop statement
export function evalForStatement(stmt: ForStatement, env: Environment): RuntimeVal {
	const start = evaluate(stmt.startExpr, env) as NumberVal;
	const end = evaluate(stmt.endExpr, env) as NumberVal;

    if (start.type !== "number" || end.type !== "number") {
        throw new Error("Loop bounds must be numbers.");
    }

    const loopVar = stmt.loopVar;
	if (end.value == null || start.value == null) {
		throw "Loop bounds cannot be null or undefined.";
	}
    for (let i = start.value; i <= end.value; i++) {
		env.declareVar(loopVar, { type: "number", value: i, env }, false);

        for (const statement of stmt.body) {
            evaluate(statement, env);
        }
    }

    return MK_NULL();
}

// Evaluate a for loop statement
export function eval_for_statement(forStmt: ForStatement, env: Environment): RuntimeVal {
    const loopVar = forStmt.loopVar;

    // Evaluate the start and end expressions
    const startValue = evaluate(forStmt.startExpr, env);
    const endValue = evaluate(forStmt.endExpr, env);

    if (startValue.type !== "number" || endValue.type !== "number") {
        throw new Error("For loop start and end expressions must evaluate to numbers.");
    }

    // Outer loop: Iterate from startValue to endValue
    for (let i = startValue.value as number; i <= (endValue.value as number); i++) {
        // Create a new environment for each iteration of the loop
        const loopEnv = env.createChildEnvironment();
		loopEnv.declareVar(loopVar, { type: "number", value: i, env: loopEnv }, false);

        // Execute the body of the loop
        for (const stmt of forStmt.body) {
            evaluate(stmt, loopEnv);
        }
    }

    return MK_NULL(); // Return null after the loop finishes
}

// Evaluate a function declaration
export function eval_function_declaration(funcDecl: FunctionDeclaration, env: Environment): RuntimeVal {
    const funcValue: RuntimeVal = {
        type: "function",
        params: funcDecl.params,
		body: funcDecl.body.body,
        env, // Capture the current environment
    };

    env.declareVar(funcDecl.name.symbol, funcValue, true); // Declare function as constant
    return MK_NULL(); // No immediate result for declaring a function
}

// Evaluate an array access expression
export function eval_array_access(node: ArrayAccess, env: Environment): RuntimeVal {
    const arrayVal = evaluate(node.array, env); // Get the array
    const indexVal = evaluate(node.index, env); // Get the index

    if (arrayVal.type !== "array") {
        throw new Error(`Cannot index non-array type: ${arrayVal.type}`);
    }
    if (indexVal.type !== "number") {
        throw new Error(`Array index must be a number`);
    }

    const array = (arrayVal as ArrayVal).elements;
    const index = indexVal.value as number;

    if (index < 0 || index >= array.length) {
        throw new Error(`Array index out of bounds: ${index}`);
    }

    return array[index];
	
}
export function eval_logical_expr(expr: LogicalExpression, env: Environment): RuntimeVal {
    // Evaluate the left operand
    const left = evaluate(expr.left, env);

    // Validate the left operand as a boolean
    if (left.type !== "boolean") {
        throw new Error(`Logical operations require boolean operands, but got '${left.type}'.`);
    }

    // Handle logical operators
    switch (expr.operator) {
        case "and": {
            // Short-circuit evaluation for `and`
            if (!left.value) {
                return { type: "boolean", value: false, env };
            }
            const right = evaluate(expr.right!, env); // Evaluate the right operand
            if (right.type !== "boolean") {
                throw new Error(`Logical 'and' requires boolean operands, but got '${right.type}'.`);
            }
            return { type: "boolean", value: left.value && right.value, env };
        }
        case "or": {
            // Short-circuit evaluation for `or`
            if (left.value) {
                return { type: "boolean", value: true, env };
            }
            const right = evaluate(expr.right!, env); // Evaluate the right operand
            if (right.type !== "boolean") {
                throw new Error(`Logical 'or' requires boolean operands, but got '${right.type}'.`);
            }
            return { type: "boolean", value: left.value || right.value, env };
        }
        case "not": {
            // Unary `not` operation
            return { type: "boolean", value: !left.value, env };
        }
        default:
            throw new Error(`Unsupported logical operator '${expr.operator}'.`);
    }
}



// Evaluate a comparison expression
export function eval_comparison_expr(expr: ComparisonExpression, env: Environment): RuntimeVal {
    const left = evaluate(expr.left, env);
    const right = evaluate(expr.right, env);

    if (left.type !== "number" || right.type !== "number") {
        throw new Error("Comparison operators require numeric operands.");
    }

    switch (expr.operator) {
		case ">":
        case "greaterThan":
			return { type: "boolean", value: (left.value ?? 0) > (right.value ?? 0), env };
		case "<":
        case "lessThan":
			return { type: "boolean", value: (left.value ?? 0) < (right.value ?? 0), env };
		case ">=":
        case "greaterThanOrEqual":
			return { type: "boolean", value: (left.value ?? 0) >= (right.value ?? 0), env };
		case "<=":
        case "lessThanOrEqual":
			return { type: "boolean", value: (left.value ?? 0) <= (right.value ?? 0), env };
		case "==":
        case "equals":
			return { type: "boolean", value: (left.value ?? 0) === (right.value ?? 0), env };
		case "!=":
        case "notEqual":
			return { type: "boolean", value: (left.value ?? 0) !== (right.value ?? 0), env };
        default:
            throw new Error(`Unsupported comparison operator '${expr.operator}'`);
    }
}


