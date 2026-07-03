import type { ParsedLevel, Position } from "@/app/lib/game/type";
import { CellType } from "@/app/lib/game/type";
import Cell from "./Cell";
import styles from "./game.module.css";

type BoardProps = {
  level: ParsedLevel;
  playerPos: Position;
  boxes: Position[];
  cellSize?: number;
};

export default function Board({ level, playerPos, boxes, cellSize = 52 }: BoardProps) {
  return (
    <div className={styles.boardWrapper}>
      <div
        className={styles.board}
        style={{
          gridTemplateColumns: `repeat(${level.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${level.height}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: level.height }, (_, r) =>
          Array.from({ length: level.width }, (_, c) => {
            const index = r * level.width + c;
            const terrain = level.grid[index];
            const isPlayer = playerPos.row === r && playerPos.col === c;
            const hasBox = boxes.some((b) => b.row === r && b.col === c);
            const boxOnTarget = hasBox && terrain === CellType.Target;

            return (
              <Cell
                key={index}
                terrain={terrain}
                hasPlayer={isPlayer}
                hasBox={hasBox}
                boxOnTarget={boxOnTarget}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
