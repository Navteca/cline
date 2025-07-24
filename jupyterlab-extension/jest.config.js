module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  moduleNameMapping: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '@jupyterlab/testutils/lib/jest-file-mock'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['/node_modules/(?!(@jupyterlab/.*)/)'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};