// ============================================
// 推箱子游戏 — 关卡定义 & 解析器
// ============================================

import { CellType, type LevelDef, type ParsedLevel } from "./type";

// ============================================
// 地图字符编码说明
// ============================================
//  #  墙（Wall）       — 不可通行
//  (空格) 地板（Floor） — 可通行
//  .  目标点（Target）  — 箱子需要被推到这里
//  $  箱子在地板上
//  *  箱子已在目标点上
//  @  玩家在地板上
//  +  玩家在目标点上
// ============================================

const LEVELS: LevelDef[] = [
  // ============ 第 1 关：入门 ============
  // 目标：把 1 个箱子推到目标点
  // 解法提示：向左绕到箱子左边，向右推，再向上推
  {
    id: 1,
    name: "入门",
    map: [
      "#####",
      "#   #",
      "# #.#",
      "# $ #",
      "# @ #",
      "#####",
    ].join("\n"),
  },

  // ============ 第 2 关：转弯 ============
  // 目标：把 2 个箱子推到目标点，注意墙角
  {
    id: 2,
    name: "转弯",
    map: [
      "#######",
      "#    ##",
      "# #. ##",
      "# $   #",
      "# .@$ #",
      "#    ##",
      "#######",
    ].join("\n"),
  },

  // ============ 第 3 关：上下 ============
  // 目标：上下各有一个箱子需要归位
  {
    id: 3,
    name: "上下",
    map: [
      "  ####  ",
      "###  ###",
      "#     .#",
      "# #$# #",
      "# .@  #",
      "## $ ##",
      " #   # ",
      " ##### ",
    ].join("\n"),
  },

  // ============ 第 4 关：走廊 ============
  // 目标：在狭窄走廊中移动 3 个箱子
  {
    id: 4,
    name: "走廊",
    map: [
      "########",
      "#  .#  #",
      "# $    #",
      "#  #.  #",
      "#  $   #",
      "#  @#  #",
      "#      #",
      "########",
    ].join("\n"),
  },

  // ============ 第 5 关：环绕 ============
  // 目标：4 个箱子围绕中心排列
  {
    id: 5,
    name: "环绕",
    map: [
      " ###### ",
      "##    ##",
      "# .##. #",
      "# $  $ #",
      "#  ##  #",
      "# .@#. #",
      "#  $ $ #",
      "##    ##",
      " ###### ",
    ].join("\n"),
  },

  // ============ 第 6 关：挑战 ============
  // 目标：复杂布局，需要仔细规划每一步
  {
    id: 6,
    name: "挑战",
    map: [
      " ######## ",
      "##  ##  ##",
      "#  .  .  #",
      "# $##$## #",
      "#  #  #  #",
      "# $ @  $ #",
      "#  .##.  #",
      "##      ##",
      " ######## ",
    ].join("\n"),
  },
];

// ============================================
// 解析器：将字符串地图转为结构化关卡数据
// ============================================

export function parseLevel(def: LevelDef): ParsedLevel {
  const lines = def.map.split("\n");
  const height = lines.length;

  // 计算最宽行的长度（短行右侧补齐）
  const width = Math.max(...lines.map((line) => line.length));

  // 初始化：全部填 Floor
  const grid: CellType[] = new Array(width * height).fill(CellType.Floor);

  let playerStart = { row: 0, col: 0 };
  const boxStarts: ParsedLevel["boxStarts"] = [];

  for (let row = 0; row < height; row++) {
    const line = lines[row];
    for (let col = 0; col < width; col++) {
      const index = row * width + col;
      // 短行右侧自动视为地板
      const ch = col < line.length ? line[col] : " ";

      switch (ch) {
        // ---- 静态地形 ----
        case "#":
          grid[index] = CellType.Wall;
          break;
        case ".":
          grid[index] = CellType.Target;
          break;
        case " ":
          grid[index] = CellType.Floor;
          break;

        // ---- 箱子（可能是 Floor 或 Target 上的箱子） ----
        case "$":
          // 箱子在地板上
          grid[index] = CellType.Floor;
          boxStarts.push({ row, col });
          break;
        case "*":
          // 箱子已在目标点上
          grid[index] = CellType.Target;
          boxStarts.push({ row, col });
          break;

        // ---- 玩家（可能是 Floor 或 Target 上的玩家） ----
        case "@":
          grid[index] = CellType.Floor;
          playerStart = { row, col };
          break;
        case "+":
          grid[index] = CellType.Target;
          playerStart = { row, col };
          break;

        // 未知字符视为地板
        default:
          grid[index] = CellType.Floor;
      }
    }
  }

  return {
    id: def.id,
    name: def.name,
    width,
    height,
    grid,
    playerStart,
    boxStarts,
  };
}

/** 关卡缓存，避免重复解析 */
const cache = new Map<number, ParsedLevel>();

/** 根据 id 获取解析后的关卡（带缓存） */
export function getLevel(id: number): ParsedLevel {
  const cached = cache.get(id);
  if (cached) return cached;

  // 如果 id 超出范围，回退到第 1 关
  const def = LEVELS.find((l) => l.id === id) ?? LEVELS[0];
  const parsed = parseLevel(def);
  cache.set(id, parsed);
  return parsed;
}

/** 关卡总数 */
export const LEVEL_COUNT = LEVELS.length;

/** 所有关卡的元信息（用于关卡选择界面，不需要解析地图） */
export function getAllLevelMeta(): { id: number; name: string }[] {
  return LEVELS.map(({ id, name }) => ({ id, name }));
}
