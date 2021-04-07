import type { FramebufferInterface } from '../types';
import { Texture } from './texture';
export declare class Framebuffer {
    #private;
    texture: Texture;
    constructor(gl: WebGLRenderingContext, { inputTexture, width, height, wrapS, wrapT, minFilter, magFilter, format, internalFormat, type, depth, }?: FramebufferInterface);
    bind(): this;
    unbind(): this;
    updateWithSize(width: number, height: number, updateTexture?: boolean): this;
    reset(): this;
    delete(): void;
}
