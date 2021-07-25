const presets = [
  [
    '@babel/preset-env',
    {
      useBuiltIns: 'usage',
      corejs: 3
    }
  ],
  '@babel/preset-react',
  '@babel/preset-typescript'
]

const plugins = ['@loadable/babel-plugin']

module.exports = {
  presets,
  plugins
}
