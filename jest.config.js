module.exports = {
    roots: ['<rootDir>/test'],  
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js'],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
  };
  