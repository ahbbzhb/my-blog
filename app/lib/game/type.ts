// ============================================
// 推箱子游戏 — 类型定义
// ============================================

/** 静态地形格子类型 */
export enum CellType {
  Floor = 0, // 地板（可通行）
  Wall = 1, // 墙壁（不可通行）
  Target = 2, // 目标点（箱子需要推到这里）
}

/** 二维坐标 */
export interface Position {
  row: number;
  col: number;
}

/** 移动方向 */
export type Direction = "up" | "down" | "left" | "right";

/** 原始关卡定义（解析前，用字符串地图表示） */
export interface LevelDef {
  id: number;
  name: string;
  /** 多行字符串，每行代表一行格子：
   *  # 墙   (空格) 地板   . 目标点
   *  $ 箱子  @ 玩家      * 箱子已在目标点上  + 玩家已在目标点上 */
  map: string;
}

/** 解析后的关卡（可直接用于游戏引擎） */
export interface ParsedLevel {
  id: number;
  name: string;
  width: number;
  height: number;
  /** row-major 扁平数组，长度 = width * height */
  grid: CellType[];
  /** 玩家初始位置 */
  playerStart: Position;
  /** 所有箱子的初始位置 */
  boxStarts: Position[];
}

/** 每一步的历史快照，用于撤销 */
export interface HistoryEntry {
  playerPos: Position;
  boxes: Position[];
  moveCount: number;
}

/** 游戏运行时状态（由 useReducer 管理） */
export interface GameState {
  levelId: number;
  playerPos: Position;
  boxes: Position[];
  moveCount: number;
  /** 历史快照栈，用于 UNDO */
  history: HistoryEntry[];
  /** 是否已通关当前关卡 */
  victory: boolean;
}

/** useReducer 的 Action 联合类型 */
export type GameAction =
  | { type: "MOVE"; direction: Direction }
  | { type: "UNDO" }
  | { type: "RESET" }
  | { type: "SELECT_LEVEL"; levelId: number }
  | { type: "DISMISS_VICTORY" }
  | { type: "RESTORE"; state: GameState };
