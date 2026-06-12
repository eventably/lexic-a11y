// Root babel config (project-wide, unlike .babelrc) so babel-jest can also
// transpile the ESM-only @afixt/a11y-assert dependency in tests
module.exports = {
  presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]],
};
