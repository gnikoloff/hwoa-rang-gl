import { Texture, TextureInterface } from './texture';
export declare class CubeTexture extends Texture {
    #private;
    constructor(gl: WebGLRenderingContext, { format, internalFormat, type, unpackAlignment, wrapS, wrapT, minFilter, magFilter, }?: TextureInterface);
    /**
     *
     * @param {Array.<HTMLImageElement | HTMLCanvasElement>} sidesImages
     * @returns {this}
     */
    addSides(sidesImages: Array<HTMLImageElement | HTMLCanvasElement>): this;
}
