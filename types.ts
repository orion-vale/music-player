export interface Visualizer {
    name: string;
    init?: (ctx: CanvasRenderingContext2D) => void;
    draw: (
        ctx: CanvasRenderingContext2D,
        dataArray: Uint8Array
    ) => void;
}