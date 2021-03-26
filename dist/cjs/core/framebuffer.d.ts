import type { FramebufferInterface } from '../types';
import { Texture } from './texture';
export declare class Framebuffer {
    #private;
    texture: Texture;
    constructor(gl: WebGLRenderingContext, { width, height, target, wrapS, wrapT, minFilter, magFilter, format, internalFormat, type, depth, }?: FramebufferInterface);
    bind(): this;
    unbind(): this;
    reset(): this;
    delete(): void;
}
