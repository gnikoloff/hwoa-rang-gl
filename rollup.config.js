import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default [
  {
    input: 'app/index.js',
    output: { file: 'dist/bundle.js' },
    plugins: [
      resolve(),
      commonjs()
    ],
  }
]
