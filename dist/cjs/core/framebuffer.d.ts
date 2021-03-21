import type { RenderTargetInterface } from '../ts-types';
import Texture from './texture';
export default class Framebuffer {
    #private;
    texture: Texture;
    constructor(gl: WebGLRenderingContext, { width, height, target, wrapS, wrapT, format, internalFormat, depth, }: RenderTargetInterface);
    bind(): this;
    unbind(): this;
    /**
     * @description reset texture
     */
    reset(): void;
    delete(): void;
}
