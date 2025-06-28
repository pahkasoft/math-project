import { MathObject } from "./math-object";
import { Nodes } from "./nodes";

export namespace ExpressionPath {
    export class Block {
        constructor(readonly node: Nodes.NNode, readonly rect = node.bounds) { }
    }

    export class Slot {
        constructor(readonly expr: Nodes.NExpression, readonly leftBlock?: Block, readonly rightBlock?: Block) { }
    }

    export interface Range<T = number> { start: T; end: T; }

    export type IteratorCallback = (pos: number, expr: Nodes.NExpression, leftBlock?: Block, rightBlock?: Block) => void;

    export class Path {
        private slotList: Slot[] = [];

        constructor(private readonly mathObject: MathObject) {
            mathObject.rootNode.gatherPath(this.slotList);
        }

        iterate(onSlot: IteratorCallback) {
            this.slotList.forEach((s, i) => onSlot(i, s.expr, s.leftBlock, s.rightBlock));
        }

        getSlotDataAt(pos: number): Slot | undefined {
            return pos >= 0 && pos < this.slotList.length ? this.slotList[pos] : undefined;
        }

        getMaxSelectionPos(): number {
            return this.slotList.length - 1;
        }

        getSelectionPosAt(x: number, y: number): number | undefined {
            let best: { pos?: number, rank?: number } = {}

            function onSlot(pos: number, expr: Nodes.NExpression, leftBlock?: Block, rightBlock?: Block) {
                if (leftBlock && leftBlock.rect.contains(x, y)) {
                    let rank = Math.abs(x - leftBlock.rect.right);
                    if (best.rank === undefined || rank < best.rank) {
                        best.pos = pos;
                        best.rank = rank;
                    }
                }
                if (rightBlock && rightBlock.rect.contains(x, y)) {
                    let rank = Math.abs(x - rightBlock.rect.left);
                    if (best.rank === undefined || rank < best.rank) {
                        best.pos = pos;
                        best.rank = rank;
                    }
                }
                if (!leftBlock && !rightBlock && expr && expr.bounds.contains(x, y)) {
                    let rank = Math.abs(x - expr.bounds.left);
                    if (best.rank === undefined || rank < best.rank) {
                        best.pos = pos;
                        best.rank = rank;
                    }
                }
            }

            this.iterate(onSlot);

            if (best.pos === undefined) {
                let r = this.mathObject.rootNode.bounds;
                if (x <= r.left) {
                    return 0;
                }
                else if (x >= r.right) {
                    return this.getMaxSelectionPos();
                }
            }

            return best.pos;
        }

        getNodeRange(node: Nodes.NNode): Range | undefined {

            let start: number | undefined = undefined,
                end: number | undefined = undefined;

            const setPos = function (pos: number) {
                if (start === undefined || end === undefined) {
                    start = end = pos;
                }
                else if (pos < start) {
                    start = pos;

                }
                else if (pos > end) {
                    end = pos;
                }
            }

            function onSlot(pos: number, expr: Nodes.NExpression, leftBlock?: Block, rightBlock?: Block) {
                let leftNode = leftBlock ? leftBlock.node : undefined;
                let rightNode = rightBlock ? rightBlock.node : undefined;

                if (rightNode === node && leftNode !== rightNode) {
                    setPos(pos);
                }
                if (leftNode === node && leftNode !== rightNode) {
                    setPos(pos);
                }
                if (!leftNode && !rightNode && expr === node) {
                    setPos(pos);
                }
            }

            this.iterate(onSlot);

            return (start === undefined || end === undefined) ? undefined : { start, end };
        }
    }

}