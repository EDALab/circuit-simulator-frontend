module.exports = {
    'root': true,
    'parserOptions': {
        'sourceType': 'module'
    },
    'env': {
        'browser': true,
        'node': true,
        'es6': true
    },
    // customize rules
    'rules': {
        //Allow extension of native data structure
        'no-extend-native': 0,
        //Allow debugger statements
        'no-debugger': 0,
        //The parentheses of the arrow expression cannot be omitted
        'arrow-parens': [2, 'always'],
        //Space before and after arrow expression
        'arrow-spacing': 2,
        //Prohibit the use of constant expressions in conditions
        'no-constant-condition': 2,
        //Generator expression * has a space before and no space after it
        'generator-star-spacing': [2, 'before'],
        //There must be a semicolon after the expression
        'semi': [2, 'always'],
        //No extra semicolons
        'no-extra-semi': 2,
        //New expressions that do not save values ​​are allowed
        'no-new': 0,
        //The default backspace is 4 spaces
        'indent': [2, 4, { 'SwitchCase': 1 }],
        //The statement can not be combined
        'one-var': 0,
        //No space is required after the function name or function keyword and between the parentheses
        'space-before-function-paren': [2, 'never'],
        //The code block allows a single line; when there are multiple lines of code, the opening brace does not wrap, and the terminating brace is independent
        'brace-style': [2, '1tbs', { 'allowSingleLine': true }],
        //Assignment in conditional statements of if, for, while, do...while is allowed
        'no-cond-assign': 0,
        //Allow multiple spaces before and after the equal sign
        'no-multi-spaces': 0,
        //Disable alert, confirm and prompt
        'no-alert': 0,
        //Disable arguments.caller or arguments.callee
        'no-caller': 2,
        //Prohibit the use of methods like eval()
        'no-implied-eval': 2,
        //Warn about the use of undeclared variables
        'no-undef': 1,
        //Disallow undefined as an identifier
        'no-undefined': 0,
        //They are not allowed to be used before the variable definition
        'no-use-before-define': 0,
        //It is forbidden to mix regular var declarations and require calls
        'no-mixed-requires': 0,
        //Disallow the use of the new operator when calling require
        'no-new-require': 2,
        //String concatenation of __dirname and __filename is prohibited
        'no-path-concat': 0,
        //Space after comma, no space before
        'comma-spacing': [2, { 'before': false, 'after': true }],
        //When taking object properties in square brackets, no spaces are required inside
        'computed-property-spacing': [2, 'never'],
        //Force the use of named function expressions
        'func-names': 0,
        //Force line break at the end of the file
        'eol-last': 2,
        //Do not allow mixed indentation of spaces and tabs
        'no-mixed-spaces-and-tabs': 2,
        //Disable trailing spaces
        'no-trailing-spaces': 2,
        //Spaces are required before and after keywords
        'keyword-spacing': 2,
        //Disable var
        'no-var': 2,
        //Strings are all single quotes
        'quotes': [2, 'single'],
        //Mandatory use of const when the variable has not changed
        'prefer-const': 2,
        //Mandatory use of ES6 abbreviations
        'object-shorthand': 2,
        //The constructor of class inheritance forces the use of super
        'constructor-super': 2,
        //'this.' is prohibited before super
        'no-this-before-super': 2,
        //In addition to functions, variables and classes are warned when used before definition
        'no-use-before-define': [1, { 'functions': false }]
    }
}
