module.exports = {
    testEnvironment: 'node',                               // 测试运行环境是 node，也可以配置 jsdom 测试浏览器环境
    roots: ['<rootDir>/src', '<rootDir>/tests'],           // 扫描目录
    moduleFileExtensions: ['ts', 'js', 'json'],            // 支持的文件扩展名
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },  // 配置路径别名
    testMatch: ['**/?(*.)+(spec|test).[tj]s'],             // 匹配测试文件规则
    transform: {                                           // 转换器
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.jest.json',
            },
        ],
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],  // 忽略编译目录
    collectCoverageFrom: [                                 // 覆盖率统计（可选）
        'src/**/*.{ts,tsx,js,jsx}',
        '!src/**/*.d.ts',
    ],
    coverageDirectory: 'coverage',                         // 覆盖率统计存放的文件夹
    passWithNoTests: true,                                 // 测试无用文件时，是否通过
    clearMocks: true,                                      // 清理 mock
}
