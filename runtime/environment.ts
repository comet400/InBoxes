
import {
	MK_BOOL,
	MK_NATIVE_FN,
	MK_NULL,
	MK_NUMBER,
	RuntimeVal,
	ArrayVal,
  } from "./values.ts";
  
  export function createGlobalEnv() {
	const env = new Environment();
  
	// Default Global Environment Variables
	env.declareVar("true", MK_BOOL(true), true);
	env.declareVar("false", MK_BOOL(false), true);
	env.declareVar("null", MK_NULL(), true);
  
	// Define a native built-in `print` method
	env.declareVar(
		"print",
		MK_NATIVE_FN((args, _scope) => {
			const values = args.map((arg) => {
				if (arg.type === "array") {
					return (arg as ArrayVal).elements.map((el) => el.value).join(", ");
				}
				return arg.value !== undefined ? arg.value : "undefined";
			});
	
			// Use Deno.stdout.writeSync for instant flushing
			const output = values.join(" ") + "\n"; // Join values with a space, add newline
			Deno.stdout.writeSync(new TextEncoder().encode(output));
	
			return MK_NULL(); // Return null to signify the function doesn't return a value
		}),
		true
	);
	

	env.declareVar(
		"input",
		MK_NATIVE_FN((args, scope) => {
			if (args.length < 1) {
				console.log("Error: The input function expects at least a variable name."); // Error message
				return MK_NULL(); // Return nothing
			}
	
			const varName = args[0].value;
			const promptMessage = args.length > 1 ? args[1].value : "Enter a value:";
	
			if (typeof varName !== "string") {
				console.log("Error: First argument to input must be the variable name (as a string).");
				return MK_NULL();
			}
	
			// Retrieve the current type of the variable in the environment
			const currentVar = scope.lookupVar(varName);
			const expectedType = currentVar?.type || null;
	
			if (!expectedType) {
				console.log(`Error: Variable '${varName}' does not exist.`);
				return MK_NULL(); // Return nothing
			}
	
			let userInput;
			let value;
	
			while (true) {
				// Use Deno's prompt to get user input
				userInput = prompt(String(promptMessage));
	
				if (userInput === null) {
					console.log("No input provided. Variable will not be updated.");
					return MK_NULL();
				}
	
				// Detect and validate the type of the user input
				if (expectedType === "number") {
					if (!isNaN(Number(userInput))) {
						value = MK_NUMBER(Number(userInput));
						break;
					} else {
						console.log(`Error: Expected a number for variable '${varName}'. Please try again.`); // Error message
					}
				} else if (expectedType === "string") {
					value = { type: "string", value: userInput, env: scope } as RuntimeVal; // Create a new string value
					break;
				} else {
					console.log(`Error: Unsupported type '${expectedType}' for variable '${varName}'.`);
					return MK_NULL();
				}
			}
	
			// Update the variable in the environment
			scope.assignVar(varName, value);
	
			return MK_NULL(); // Return nothing
		}),
		true
	);
	
	
	
  
	// Define a built-in `time` method
	function timeFunction(_args: RuntimeVal[], _env: Environment) {
	  return MK_NUMBER(Date.now());
	}
	env.declareVar("time", MK_NATIVE_FN(timeFunction), true);
  
	// Define a built-in `length` method for arrays
	function lengthFunction(args: RuntimeVal[], _env: Environment) {
	  if (args.length !== 1 || args[0].type !== "array") {
		throw `Invalid usage of length(). Expected 1 array argument.`;
	  }
	  return MK_NUMBER((args[0] as ArrayVal).elements.length);
	}
	env.declareVar("length", MK_NATIVE_FN(lengthFunction), true);
  
	return env;
  }
  
  export default class Environment {
	private parent?: Environment;
	private variables: Map<string, RuntimeVal>;
	private constants: Set<string>;
  
	constructor(parentENV?: Environment) {
	  this.parent = parentENV;
	  this.variables = new Map();
	  this.constants = new Set();
	}
  
	// Declare a variable in the current environment
	public declareVar(
	  varname: string,
	  value: RuntimeVal,
	  constant: boolean
	): RuntimeVal {
	  if (this.variables.has(varname)) {
		throw `Cannot declare variable ${varname}. It is already defined.`;
	  }
  
	  this.variables.set(varname, value);
	  if (constant) {
		this.constants.add(varname);
	  }
	  return value;
	}
  
	// Assign a value to a variable
	public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
	  const env = this.resolve(varname);
  
	  // Cannot assign to a constant variable
	  if (env.constants.has(varname)) {
		throw `Cannot reassign variable ${varname} as it was declared constant.`;
	  }
  
	  env.variables.set(varname, value);
	  return value;
	}
  
	/**
	 * Lookup a variable in the current or parent environments
	 * @param varname Variable name
	 * @returns The value of the variable
	 */
	public lookupVar(varname: string): RuntimeVal {
	  const env = this.resolve(varname);
	  const value = env.variables.get(varname);
  
	  if (!value) {
		throw `Variable '${varname}' is not defined.`;
	  }
	  return value;
	}
  
	/**
	 * Resolve a variable to the environment in which it was declared
	 * @param varname Variable name
	 * @returns The environment containing the variable
	 */
	public resolve(varname: string): Environment {
	  if (this.variables.has(varname)) {
		return this;
	  }
  
	  if (!this.parent) {
		throw `Cannot resolve '${varname}' as it does not exist.`;
	  }
  
	  return this.parent.resolve(varname);
	}
	/**
 * Create a child environment for scoping
 * @returns A new Environment instance with this as its parent
 */
public createChildEnvironment(): Environment {
    return new Environment(this);
}
  }

  
  