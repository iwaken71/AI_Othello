export class Position {
  constructor(public readonly row: number, public readonly col: number) {}

  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col;
  }

  toString(): string {
    return `(${this.row}, ${this.col})`;
  }
}

// 8方向の移動ベクトル
export const DIRECTIONS = [
  new Position(-1, -1), // 左上
  new Position(-1, 0),  // 上
  new Position(-1, 1),  // 右上
  new Position(0, -1),  // 左
  new Position(0, 1),   // 右
  new Position(1, -1),  // 左下
  new Position(1, 0),   // 下
  new Position(1, 1),   // 右下
];
