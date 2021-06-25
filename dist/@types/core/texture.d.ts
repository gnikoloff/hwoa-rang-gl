/**
 * Texture class used to store image, video, canvas and data as typed arrays
 * @public
 */
export declare class Texture {
    protected gl: WebGLRenderingContext;
    protected texture: WebGLTexture | null;
    protected width: number;
    protected height: number;
    protected format: number;
    protected internalFormat: number;
    protected type: number;
    protected anisotropyExtension: EXT_texture_filter_anisotropic;
    protected target: number;
    static isPowerOf2: (width: number, height: number) => boolean;
    constructor(gl: WebGLRenderingContext, { format, internalFormat, type, unpackAlignment, wrapS, wrapT, minFilter, magFilter, target, }?: TextureInterface);
    /**
     * @returns {WebGLTexture|null}
     */
    getTexture(): WebGLTexture | null;
    /**
     * Binds the texture to the target
     * @returns {this}
     */
    bind(): this;
    /**
     * Unbinds the texture
     * @returns {this}
     */
    unbind(): this;
    /**
     * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image
     * @param {number} [width]
     * @param {number} [height
     * @returns {this}
     */
    fromImage(image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, width?: number, height?: number): this;
    /**
     * @param {number} width
     * @param {number} height
     * @returns {this}
     */
    fromSize(width: number, height: number): this;
    /**
     * @param dataArray
     * @param {number} [width]
     * @param {number} [height]
     * @returns {this}
     */
    fromData(dataArray: any, width: number, height: number): this;
    /**
     * @returns {this}
     */
    generateMipmap(): this;
    /**
     * @param {GLEnum} [format = gl.RGB]
     * @param {GLEnum} [internalFormat = gl.RGB]
     * @param {GLenum} [type = gl.UNSIGNED_BYTE]
     * @returns {this}
     */
    setFormat(format?: number, internalFormat?: number, type?: number): this;
    /**
     * @returns {this}
     */
    setIsFlip(flip?: number): this;
    /**
     * @param {GLenum} name
     * @param params
     * @returns {this}
     */
    setPixelStore(name: GLenum, params: GLenum): this;
    /**
     * @param {GLenum} [filter = gl.LINEAR]
     * @returns {this}
     */
    setMinFilter(filter?: number): this;
    /**
     * @param {GLenum} [filter = gl.LINEAR]
     * @returns {this}
     */
    setMagFilter(filter?: number): this;
    /**
     *
     * @param {GLenum} [wrapS = gl.CLAMP_TO_EDGE]
     * @param {GLenum} [wrapT = gl.CLAMP_TO_EDGE]
     * @returns {this}
     */
    setWrap(wrapS?: number, wrapT?: number): this;
    /**
     *
     * @param {number} anisotropyLevel
     * @returns {this}
     */
    setAnisotropy(anisotropyLevel: number): this;
    delete(): void;
}
export interface TextureInterface {
    /**
     * @default gl.RGB
     */
    format?: GLenum;
    /**
     * @default gl.RGB
     */
    internalFormat?: GLenum;
    /**
     * @default gl.UNSIGNED_BYTE
     */
    type?: GLenum;
    /**
     * @default 1
     */
    unpackAlignment?: number;
    /**
     * @default gl.CLAMP_TO_EDGE
     */
    wrapS?: GLenum;
    /**
     * @default gl.CLAMP_TO_EDGE
     */
    wrapT?: GLenum;
    /**
     * @default gl.LINEAR
     */
    minFilter?: GLenum;
    /**
     * @default gl.LINEAR
     */
    magFilter?: GLenum;
    /**
     * @default gl.TEXTURE_2D
     */
    target?: GLenum;
}
