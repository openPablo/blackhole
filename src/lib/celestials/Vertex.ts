export class Vertex {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    getFloat32(): Float32Array {
        return new Float32Array([this.x, this.y]);
    }
}