import Parser from "./frontend/parser.ts";
import { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

const filename = Deno.args[0]; // Get the first argument
if (!filename) {
    console.error("Usage: deno run --allow-read main.ts <filename>");
    Deno.exit(1);
}

run(filename).catch((error) => {
    console.error("Error:", error.message);
});

async function run(filename: string) {
    const parser = new Parser();
    const env = createGlobalEnv();

    console.log(`Executing ${filename}...`);
    const sourceCode = await Deno.readTextFile(filename);

    try {
        const program = parser.parse(sourceCode); // Parse the source code
        evaluate(program, env); // Run the program
    } catch (error) {
        if (error instanceof Error) {
            console.error("An error occurred:", error.message);
        } else {
            console.error("An unknown error occurred");
        }
    }
}
