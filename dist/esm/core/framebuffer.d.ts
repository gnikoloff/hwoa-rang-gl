import { Texture } from './texture';
interface FramebufferInterface {
    /**
     * @default gl.canvas.width
     */
    width?: number;
    /**
     * @default gl.canvas.height
     */
    height?: number;
    /**
     * @default gl.CLAMP_TO_EDGE
     */
    wrapS?: GLenum;
    /**
     * @default gl.CLAMP_TO_EDGE
     */
    wrapT?: GLenum;
    /**
     * @default gl.NEAREST
     */
    minFilter?: GLenum;
    /**
     * @default gl.NEAREST
     */
    magFilter?: GLenum;
    /**
     * @default gl.RGBA
     */
    format?: GLenum;
    /**
     * @default gl.UNSIGNED_BYTE
     */
    type?: GLenum;
    /**
     * @default gl.RGBA
     */
    internalFormat?: GLenum;
    /**
     * @default true
     */
    depth?: boolean;
    inputTexture?: Texture;
}
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
export {};
