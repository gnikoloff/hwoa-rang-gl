export default class Texture {
    #private;
    static isPowerOf2: (width: any, height: any) => boolean;
    constructor(gl: WebGLRenderingContext, { format, internalFormat, type, unpackAlignment, wrapS, wrapT, minFilter, magFilter, }?: {
        format?: number;
        internalFormat?: any;
        type?: number;
        unpackAlignment?: number;
        wrapS?: number;
        wrapT?: number;
        minFilter?: number;
        magFilter?: number;
    });
    getTexture(): WebGLTexture;
    bind(): this;
    unbind(): this;
    fromImage(image: any, width?: any, height?: any): this;
    fromSize(width: any, height: any): this;
    fromData(dataArray: any, width: any, height: any): this;
    generateMipmap(): this;
    setFormat(format?: number, internalFormat?: number, type?: number): this;
    setIsFlip(): this;
    setPixelStore(name: any, params: any): this;
    setMinFilter(filter?: number): this;
    setMagFilter(filter?: number): this;
    setWrap(wrapS?: number, wrapT?: number): this;
    setAnisotropy(anisotropyLevel: any): this;
    delete(): this;
}
