export default class Texture {
    #private;
    texture: WebGLTexture;
    constructor(gl: WebGLRenderingContext, { image, width, height, format, internalFormat, type, isFlip, useMipmaps, wrapS, wrapT, anisotropy, minFilter, magFilter }: {
        image?: any;
        width: any;
        height: any;
        format?: number;
        internalFormat?: any;
        type?: number;
        isFlip?: boolean;
        useMipmaps?: boolean;
        wrapS?: number;
        wrapT?: number;
        anisotropy?: number;
        minFilter?: number;
        magFilter?: number;
    });
    bind(): this;
    unbind(): this;
}
