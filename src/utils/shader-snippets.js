import {
  MODEL_MATRIX_UNIFORM_NAME,
  VIEW_MATRIX_UNIFORM_NAME,
  PROJECTION_MATRIX_UNIFORM_NAME,
} from './gl-constants'

export const vertexShaderSourceHead = `
  uniform mat4 ${MODEL_MATRIX_UNIFORM_NAME};
  uniform mat4 ${VIEW_MATRIX_UNIFORM_NAME};
  uniform mat4 ${PROJECTION_MATRIX_UNIFORM_NAME};
`

export const fragmentShaderSourceHead = `
  precision highp float;
`
