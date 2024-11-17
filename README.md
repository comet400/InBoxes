
Here’s an awesome README.md file for your coding language, InBoxes:

InBoxes Programming Language
InBoxes is a fun and innovative programming language designed to encapsulate all variables, logic, and operations inside a box. It’s simple, unique, and a great way to learn about language design while having fun! 🎉

Features
Core Features
Easy-to-use syntax with keywords like box, boxes, if, ifNot, while, and more.
Flexible Variables: Supports numbers, strings, arrays, and booleans.
User Input: Use input() to dynamically update variable values at runtime.
Print Statements: Print any variable, string, or number using print().
Arithmetic Operations: Perform basic operations like addition, subtraction, multiplication, and division.
Logical and Comparison Operators:
Supported: and, or, >, <, >=, <=, ==, !=.
Not Supported: Traditional not operators. Instead, use ifNot and whileNot for negated conditions.
Control Flow:
if, ifNot, and while statements.
Custom negated control flow: ifNot and whileNot for negated logic.
Arrays: Supports initialization, access, and assignment for arrays.
Syntax and Usage
Variable Declaration
inboxes
Copiar código
# Declare a variable
box x = 10 end

# Declare a string variable
box message = "Hello, World!" end

# Declare an array
boxes myArray = [1, 2, 3] end

# Access and update arrays
myArray[1] = 5 end
print(myArray[1]) # Outputs: 5
Control Flow
if and ifNot Statements
inboxes
Copiar código
box x = 5 end

# Normal if statement
if x > 0 doIt
    print("x is positive!")
end

# Negated if statement
ifNot x > 10 doIt
    print("x is not greater than 10!")
end
while and whileNot Loops
inboxes
Copiar código
box counter = 0 end

# Normal while loop
while counter < 5 doIt
    print(counter)
    counter = counter + 1 end
end

# Negated while loop
whileNot counter > 10 doIt
    print("Counter is less than or equal to 10")
    counter = counter + 1 end
end
User Input
inboxes
Copiar código
# Input a value from the user
box name = "" end
input("name", "Enter your name: ")
print("Hello, ", name, "!")
Logical and Comparison Operators
inboxes
Copiar código
# Logical operators
if x > 5 and x < 10 doIt
    print("x is between 5 and 10.")
end

if x < 5 or x > 10 doIt
    print("x is outside the range 5-10.")
end
Functions
inboxes
Copiar código
# Define a function
function addNumbers(a, b) doIt
    box result = a + b end
    print(result)
end

# Call the function
addNumbers(5, 10)
Limitations
While InBoxes is a fun and powerful language, it has some limitations:

No not Operator: Instead of using not, you must use ifNot and whileNot for negated conditions.

Example:
inboxes
Copiar código
ifNot x > 10 doIt
    print("x is not greater than 10.")
end
No Nested Arrays: Arrays cannot contain other arrays as elements.

This will not work:
inboxes
Copiar código
boxes nestedArray = [[1, 2], [3, 4]] end
No Else Blocks: InBoxes does not support else statements. You must use separate if statements to handle alternate logic.

Limited Libraries: Currently, InBoxes supports only built-in functions like print() and input().

How to Run InBoxes Programs
Prerequisites
Install Deno: https://deno.land
Run Your Program
Save your code in a file with the .ibox extension (e.g., program.ibox) and execute it as follows:

bash
Copiar código
deno run --allow-read main.ts program.ibox
Example Program: Hi-Lo Game
inboxes
Copiar código
# A simple Hi-Lo guessing game

box target = 42 end
box guess = 0 end
box attempts = 0 end

print("Welcome to the Hi-Lo Game!")
print("Guess the number between 1 and 100.")

while guess > target or guess < target doIt
    input("guess", "Enter your guess: ")
    attempts = attempts + 1 end

    if guess > target doIt
        print("Too high! Try again.")
    end

    if guess < target doIt
        print("Too low! Try again.")
    end
end

print("Congratulations! You guessed the number in ", attempts, " attempts.")
Future Features
Support for nested arrays.
Implementation of else statements for more flexible logic.
Advanced I/O operations (e.g., file reading/writing).
More built-in functions for string and array manipulation.
Contributing
This is a portfolio and fun project! If you want to contribute or provide feedback, feel free to reach out or fork the repository.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Enjoy programming with InBoxes and think inside the box! 📦
