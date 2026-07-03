"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import type { GameState, GameAction } from "@/app/lib/game/type";
import { getLevel, LEVEL_COUNT, getAllLevelMeta } from "@/app/lib/game/level";
import {
  processMove,
  checkVictory,
  createInitialState,
  createSnapshot,
  keyToDirection,
} from "@/app/lib/game/engine";
import { useSokobanProgress } from "@/app/hooks/useSokobanProgress";
import Board from "./Board";
import GameInfo from "./GameInfo";
import Controls from "./Controls";
import styles from "./game.module.css";

// ============================================
// Reducer
// ============================================

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "MOVE": {
      if (state.victory) return state;

      const level = getLevel(state.levelId);
      const result = processMove(level, state.playerPos, state.boxes, action.direction);
      if (!result) return state;

      const newState: GameState = {
        ...state,
        playerPos: result.playerPos,
        boxes: result.boxes,
        moveCount: state.moveCount + 1,
        history: [...state.history, createSnapshot(state)],
      };

      if (checkVictory(level, newState.boxes)) {
        newState.victory = true;
      }

      return newState;
    }

    case "UNDO": {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        playerPos: { ...prev.playerPos },
        boxes: prev.boxes.map((b) => ({ ...b })),
        moveCount: prev.moveCount,
        history: state.history.slice(0, -1),
        victory: false,
      };
    }

    case "RESET": {
      return createInitialState(getLevel(state.levelId));
    }

    case "SELECT_LEVEL": {
      return createInitialState(getLevel(action.levelId));
    }

    case "DISMISS_VICTORY": {
      return { ...state, victory: false };
    }

    case "RESTORE": {
      // 从 localStorage 恢复，但胜利状态不保留
      return { ...action.state, victory: false };
    }

    default:
      return state;
  }
}

// ============================================
// 组件
// ============================================

export default function SokobanGame() {
  const [state, dispatch] = useReducer(gameReducer, 1, (id) =>
    createInitialState(getLevel(id)),
  );

  // ---- 进度 + 持久化 ----
  const { completedLevels, hydrated, savedState, markCompleted, persistGameState } =
    useSokobanProgress();

  // 通关标记
  useEffect(() => {
    if (state.victory) markCompleted(state.levelId);
  }, [state.victory, state.levelId, markCompleted]);

  // 挂载后恢复上次的游戏状态
  const didRestore = useRef(false);
  useEffect(() => {
    if (didRestore.current || !hydrated || !savedState) return;
    didRestore.current = true;
    dispatch({ type: "RESTORE", state: savedState });
  }, [hydrated, savedState]);

  // 状态变化 → 保存到 localStorage
  useEffect(() => {
    if (!hydrated) return;
    persistGameState(state);
  }, [state, hydrated, persistGameState]);

  // ---- 键盘 ----
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    const dir = keyToDirection(e.key);
    if (dir) {
      e.preventDefault();
      dispatch({ type: "MOVE", direction: dir });
      return;
    }

    if (e.key.toLowerCase() === "z" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      dispatch({ type: "UNDO" });
      return;
    }

    if (e.key.toLowerCase() === "r" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      dispatch({ type: "RESET" });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ---- 派生数据 ----
  const level = getLevel(state.levelId);
  const levelMeta = getAllLevelMeta();

  function isUnlocked(id: number): boolean {
    if (id === 1) return true;
    if (completedLevels.includes(id)) return true;
    if (completedLevels.includes(id - 1)) return true;
    return false;
  }

  // ---- 渲染 ----
  return (
    <div className={styles.gameContainer}>
      {/* 标题 */}
      <div className={styles.gameTitle}>🎮 推箱子</div>

      {/* 关卡选择 */}
      <div className={styles.levelSelect}>
        {levelMeta.map(({ id, name }) => {
          let btnClass = styles.levelBtn;
          if (id === state.levelId) {
            btnClass += ` ${styles.levelBtnActive}`;
          } else if (completedLevels.includes(id)) {
            btnClass += ` ${styles.levelBtnCompleted}`;
          }

          return (
            <button
              key={id}
              className={btnClass}
              disabled={hydrated ? !isUnlocked(id) : id !== 1}
              onClick={() => dispatch({ type: "SELECT_LEVEL", levelId: id })}
              title={hydrated && isUnlocked(id) ? name : `${name}（未解锁）`}
            >
              {id}
            </button>
          );
        })}
      </div>

      {/* 信息栏 */}
      <GameInfo
        levelId={state.levelId}
        levelName={level.name}
        moveCount={state.moveCount}
      />

      {/* 棋盘 + 胜利遮罩 */}
      <div className={styles.boardWrapper}>
        <Board
          level={level}
          playerPos={state.playerPos}
          boxes={state.boxes}
        />

        {state.victory && (
          <div className={styles.victoryOverlay}>
            <div className={styles.victoryCard}>
              <div className={styles.victoryEmoji}>🎉</div>
              <div className={styles.victoryTitle}>通关！</div>
              <div className={styles.victoryStats}>
                共 {state.moveCount} 步
              </div>
              <div className={styles.victoryButtons}>
                <button
                  className={styles.victoryBtn}
                  onClick={() => dispatch({ type: "RESET" })}
                >
                  🔄 再玩一次
                </button>
                {state.levelId < LEVEL_COUNT && (
                  <button
                    className={`${styles.victoryBtn} ${styles.victoryBtnPrimary}`}
                    onClick={() =>
                      dispatch({
                        type: "SELECT_LEVEL",
                        levelId: state.levelId + 1,
                      })
                    }
                  >
                    下一关 →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 控制栏 */}
      <Controls
        canUndo={state.history.length > 0}
        onUndo={() => dispatch({ type: "UNDO" })}
        onReset={() => dispatch({ type: "RESET" })}
      />
    </div>
  );
}
