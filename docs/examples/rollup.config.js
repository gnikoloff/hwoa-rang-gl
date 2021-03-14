import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourcemaps from 'rollup-plugin-sourcemaps'
import json from '@rollup/plugin-json'
import copy from 'rollup-plugin-copy'

import examplesDefinitions from './EXAMPLES.json'

const exampleInputs = examplesDefinitions.reduce((acc, { children }) => {
  acc.push(...children.filter(({ id }) => id).map(({ id }) => id))
  return acc
}, [])

const sharedPlugins = [json(), commonjs(), nodeResolve(), sourcemaps()]

export default [
  {
    input: `index.js`,
    output: {
      file: 'dist/index.js',
      format: 'iife',
    },
    plugins: [
      copy({
        targets: [{ src: `index.html`, dest: `dist` }],
        targets: [{ src: `assets`, dest: `dist` }],
      }),
      ...sharedPlugins,
    ],
  },
  ...exampleInputs.map((input) => ({
    input: `examples-src/${input}`,
    output: {
      dir: `dist/${input}`,
      format: 'iife',
    },
    plugins: [
      copy({
        targets: [
          { src: `examples-src/${input}/index.html`, dest: `dist/${input}` },
        ],
      }),
      ...sharedPlugins,
    ],
  })),
]
