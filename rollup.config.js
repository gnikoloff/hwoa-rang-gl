import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import sourcemaps from 'rollup-plugin-sourcemaps'

import pkg from './package.json'

const input = ['src/index.ts']

export default {
  input,
  output: [
    { file: pkg.main, name: 'hwoaRangGL', format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true,
      declarationDir: 'dist/src',
    }),
    commonjs(),
    nodeResolve(),
    sourcemaps(),
  ],
}
