import {
	FunctionDeclaration,
	Program,
    VariableDeclaration,
    ReturnStatement,
} from "../../frontend/ast.ts";

import Environment from "../environment.ts";

import { evaluate } from "../interpreter.ts";

import { FunctionValue, MK_NULL, RuntimeVal } from "../values.ts";

// Evaluate a program
export function eval_program(program: Program, env: Environment): RuntimeVal {
	let lastEvaluated: RuntimeVal = MK_NULL();
	for (const statement of program.body) {
		lastEvaluated = evaluate(statement, env);
	}
	return lastEvaluated;
}

// Evaluate a variable declaration
export function eval_var_declaration(
    declaration: VariableDeclaration,
    env: Environment
): RuntimeVal {
    const value = declaration.initializer
        ? evaluate(declaration.initializer, env)
        : MK_NULL();

    return env.declareVar(declaration.name.symbol, value, declaration.constant);
}

// Evaluate a function declaration
export function eval_function_declaration(
    declaration: FunctionDeclaration,
    env: Environment
): RuntimeVal {
    // Convert parameters from Identifier[] to string[]
    const parameterNames = declaration.params.map((param) => param.symbol);

    // Create the function value
    const fn = {
        type: "function",
        name: declaration.name.symbol, // Convert Identifier to string
        parameters: parameterNames,    // Use the converted string array
        declarationEnv: env,
        body: declaration.body.body,
    } as FunctionValue; // Cast to FunctionValue

    return env.declareVar(declaration.name.symbol, fn, true);
}

export function eval_return_statement(
	statement: ReturnStatement, // The statement to evaluate
	env: Environment // The environment to evaluate the statement in
): RuntimeVal {
    return statement.argument ? evaluate(statement.argument, env) : MK_NULL();
}


