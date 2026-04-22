module.exports = {
    root: true,
    env: { browser: true, es2020: true, node: false },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist/', 'node_modules/', '.eslintrc.cjs', 'jest.config.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
        // React
        'react-refresh/only-export-components': ['warn',{ 'allowConstantExport': true }],
        'react-hooks/rules-of-hooks': 'error',                     // 检查 Hook 使用规则，如 Hook 不能在条件语句中使用
        'react-hooks/exhaustive-deps': 'warn',                     // 检查依赖数组完整性
        // TS
        '@typescript-eslint/no-unused-vars': 'off',                // 允许未使用的变量
        '@typescript-eslint/no-explicit-any': 'warn',              // 避免滥用 any
        '@typescript-eslint/no-inferrable-types': 'off',           // 禁止对推断类型的多余注解
        '@typescript-eslint/consistent-type-imports': ['warn', { 'prefer': 'type-imports' }],      // 强制使用 type imports
        // Eslint
        // JS
        'unicode-bom': ['warn', 'never'],                          // must use utf-8
        'no-var': ['error'],                                       // use const no var
        'prefer-const': ['error'],                                 // not use let
        'no-unused-vars': ['off'],                                 // 允许未使用的变量
        'quotes': ['warn', 'single'],                              // use single quotes
        'eqeqeq': ['warn', 'always', { null: 'ignore' }],          // use ===
        'no-extra-boolean-cast': ['off'],                          // allow !! and Boolean()
        'no-duplicate-imports': ['warn'],                          // 禁止重复 import，不分开导入,  import a, { b } from 'x'
        // function
        'no-empty': ['warn'],                                      // 禁止空代码块
        'func-style': ['warn', 'expression'],                      // 统一使用函数表达式  function f() {} -> const f = function() {}
        'prefer-arrow-callback': ['warn'],                         // 回调优先用箭头函数  [1, 2].map(x => x * 2)
        'no-return-await': ['warn'],                               // 避免多余 return await,  return await fetch() -> return fetch()
        'max-depth': ['warn', 4],                                  // 限制函数嵌套层级为 4
        'max-params': ['warn', 5],                                 // 函数参数个数限制为 5
        // space
        'comma-dangle': ['warn', 'always-multiline'],              // use , end in object and array
        'comma-spacing': ['warn', { before: false, after: true }], // 逗号后有空格  let a, b;
        'semi-spacing': ['warn', { before: false, after: true }],  // 分号后有空格  let a; let b;
        'space-in-parens': ['warn', 'never'],                      // 括号内无空格  let a = (1 + 2) * 3;
        'space-infix-ops': ['warn'],                               // 运算符两边必须空格  a + b
        'block-spacing': ['warn', 'always'],                       // {} 块内加空格  function() { return 1 }
        'keyword-spacing': ['warn', { 'before': true, 'after': true }],                            // add space before and after keywords
        'key-spacing': ['warn', { 'beforeColon': false, 'afterColon': true, 'mode': 'strict' }],   // : after with one space between object keys and values
        'object-curly-spacing': ['warn', 'always'],                // add space in object
        'space-before-function-paren': ['warn', {                  // 函数括号前添加空格
            'anonymous': 'always',                                 // 匿名函数
            'named': 'never',                                      // 命名函数
            'asyncArrow': 'always'                                 // 异步箭头函数
        }],
        // 缩进
        'indent': ['warn', 4, {                                    // indent with 4 spaces
            'MemberExpression': 'off',                             // 忽略链式调用换行时缩进 Promise.then()
            'SwitchCase': 1,                                       // switch case 缩进 1
            'offsetTernaryExpressions': true,                      // 三元表达式的 ? 和 : 相对上层多一个缩进
        }],
        'no-tabs': ['error'],                                      // disabled tab
        'no-mixed-spaces-and-tabs': ['warn'],                      // disabled mixed
        // file
        'semi': ['warn', 'never'],                                 // no end of ;
        'no-trailing-spaces': ['warn', { 'skipBlankLines': false, 'ignoreComments': false }],      // no end of spaces
        'no-multiple-empty-lines': ['warn', { 'max': 2 }],         // max 2 empty lines in file
        'eol-last': ['error', 'always'],                           // file end of empty line
        'max-lines': ['warn', 300],                                // maximum 300 of lines per file
    },
}
