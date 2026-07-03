// ============================================
// 推箱子游戏 — 纯游戏引擎
// ============================================

import { CellType, type Direction, type ParsedLevel, type Position, type GameState, type HistoryEntry } from "./type";

// ============================================
// 方向 → 坐标偏移映射
// ============================================

const DIRECTION_DELTA: Record<Direction, Position> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

// ============================================
// 工具函数
// ============================================

/** 坐标 → 扁平数组索引 */
function idx(width: number, pos: Position): number {
  return pos.row * width + pos.col;
}

/** 在 boxes 数组中查找某个位置的箱子，返回索引，没找到返回 -1 */
function findBox(boxes: Position[], pos: Position): number {
  return boxes.findIndex((b) => b.row === pos.row && b.col === pos.col);
}

/** 浅拷贝 Position */
function copyPos(p: Position): Position {
  return { row: p.row, col: p.col };
}

// ============================================
// 核心移动逻辑
// ============================================

/**
 * 尝试沿某个方向移动玩家。
 * 返回新的 { playerPos, boxes }，移动被阻挡则返回 null。
 */
export function processMove(
  level: ParsedLevel,
  playerPos: Position,
  boxes: Position[],
  direction: Direction,
): { playerPos: Position; boxes: Position[] } | null {
  const delta = DIRECTION_DELTA[direction];
  const newRow = playerPos.row + delta.row;
  const newCol = playerPos.col + delta.col;
  const newIndex = idx(level.width, { row: newRow, col: newCol });

  // 1. 目标格子是墙 → 不能移动
  if (level.grid[newIndex] === CellType.Wall) {
    return null;
  }

  // 2. 目标格子有箱子 → 尝试推箱子
  const boxIdx = findBox(boxes, { row: newRow, col: newCol });
  if (boxIdx !== -1) {
    // 计算箱子被推到的位置（同方向再走一步）
    const boxNewRow = newRow + delta.row;
    const boxNewCol = newCol + delta.col;
    const boxNewIndex = idx(level.width, { row: boxNewRow, col: boxNewCol });

    // 2a. 箱子目标位置是墙 → 推不动
    if (level.grid[boxNewIndex] === CellType.Wall) {
      return null;
    }

    // 2b. 箱子目标位置有其他箱子 → 不能一次推两个
    if (findBox(boxes, { row: boxNewRow, col: boxNewCol }) !== -1) {
      return null;
    }

    // 2c. 可以推！复制 boxes 数组，移动被推的箱子
    const newBoxes = boxes.map(copyPos);
    newBoxes[boxIdx] = { row: boxNewRow, col: boxNewCol };

    return {
      playerPos: { row: newRow, col: newCol },
      boxes: newBoxes,
    };
  }

  // 3. 目标格子是空地/目标点 → 直接走过去
  return {
    playerPos: { row: newRow, col: newCol },
    boxes: boxes.map(copyPos),
  };
}

// ============================================
// 胜利判定
// ============================================

/**
 * 检查是否通关：所有目标点都有箱子在上面。
 * 把所有箱子位置放入 Set，遍历 grid 找 Target 格子逐一核对。
 */
export function checkVictory(level: ParsedLevel, boxes: Position[]): boolean {
  const boxSet = new Set<number>();
  for (const b of boxes) {
    boxSet.add(idx(level.width, b));
  }

  for (let i = 0; i < level.grid.length; i++) {
    if (level.grid[i] === CellType.Target && !boxSet.has(i)) {
      return false;
    }
  }

  return true;
}

// ============================================
// 状态构建
// ============================================

/** 从解析后的关卡创建初始游戏状态 */
export function createInitialState(level: ParsedLevel): GameState {
  return {
    levelId: level.id,
    playerPos: copyPos(level.playerStart),
    boxes: level.boxStarts.map(copyPos),
    moveCount: 0,
    history: [],
    victory: false,
  };
}

/** 根据当前状态创建一个历史快照（在每次成功移动前调用） */
export function createSnapshot(state: GameState): HistoryEntry {
  return {
    playerPos: copyPos(state.playerPos),
    boxes: state.boxes.map(copyPos),
    moveCount: state.moveCount,
  };
}

// ============================================
// 键盘映射（供组件层使用）
// ============================================

/** 将 WASD / 方向键 映射为 Direction */
export function keyToDirection(key: string): Direction | null {
  switch (key.toLowerCase()) {
    case "w":
    case "arrowup":
      return "up";
    case "s":
    case "arrowdown":
      return "down";
    case "a":
    case "arrowleft":
      return "left";
    case "d":
    case "arrowright":
      return "right";
    default:
      return null;
  }
}
