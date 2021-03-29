import { Node } from './Node';
import { Vector2d } from './types';
export declare const DD: {
    readonly isDragging: boolean;
    justDragged: boolean;
    readonly node: Node<import("./Node").NodeConfig>;
    _dragElements: Map<number, {
        node: Node<import("./Node").NodeConfig>;
        startPointerPos: Vector2d;
        offset: Vector2d;
        pointerId?: number;
        dragStatus: "stopped" | "ready" | "dragging";
    }>;
    _drag(evt: any): void;
    _endDragBefore(evt?: any): void;
    _endDragAfter(evt: any): void;
};
