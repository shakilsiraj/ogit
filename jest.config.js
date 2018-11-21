module.exports = {
    "globals": {
        "ts-jest": {
            "diagnostics": true,
            "tsConfig": "tsconfig.spec.json"
        },
    },
    "testPathIgnorePatterns": [
        "<rootDir>/.c9/", "<rootDir>/node_modules/"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "collectCoverage": true,
    "collectCoverageFrom": [
        "src/**/*.ts"
    ],
    "coverageReporters": ["text-summary"],
    "verbose": true,
    "transformIgnorePatterns": [
        "/node_modules/(?!@tsed/testing).+\\.js$"
    ],
    "testEnvironment": "node"
}
