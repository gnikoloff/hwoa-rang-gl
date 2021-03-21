import type { RenderTargetInterface } from '../ts-types';
export default class RenderTarget {
    #private;
    width: any;
    height: any;
    constructor(gl: WebGLRenderingContext, { width, height, target, wrapS, wrapT, format, internalFormat, depth, }: RenderTargetInterface);
    bind(): this;
    unbind(): this;
    bindTexture(): this;
    unbindTexture(): this;
}
