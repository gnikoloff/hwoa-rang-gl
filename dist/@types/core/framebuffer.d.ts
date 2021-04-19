import { Texture } from './texture';
interface FramebufferOptions {
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
    /**
     * @description Controls wether to use depth texture using WEBGL_depth_texture extension or regular renderbuffer
     * @default true
     */
    useDepthRenderBuffer?: boolean;
    /**
     * @description Optional input texture, otherwise a new empty one will be generated
     */
    inputTexture?: Texture;
}
export declare class Framebuffer {
    #private;
    texture: Texture;
    depthTexture?: Texture;
    constructor(gl: WebGLRenderingContext, params?: FramebufferOptions);
    bind(): this;
    unbind(): this;
    updateWithSize(width: number, height: number, updateTexture?: boolean): this;
    reset(): this;
    delete(): void;
}
export {};
