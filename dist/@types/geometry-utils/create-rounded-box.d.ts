export declare class VRot90 {
    static xp(v: any, o: any): any;
    static xn(v: any, o: any): any;
    static yp(v: any, o: any): any;
    static yn(v: any, o: any): any;
    static zp(v: any, o: any): any;
    static zn(v: any, o: any): any;
    static xp_yn(v: any, o: any): any;
    static xp_yp(v: any, o: any): any;
    static xp_yp_yp(v: any, o: any): any;
    static xp_xp(v: any, o: any): any;
}
export declare const createRoundedBox: ({ width, height, depth, radius, div, }: {
    width?: number | undefined;
    height?: number | undefined;
    depth?: number | undefined;
    radius?: number | undefined;
    div?: number | undefined;
}) => {
    vertices: Float32Array;
    normal: Float32Array;
    uv: Float32Array;
    indices: Uint16Array;
};
