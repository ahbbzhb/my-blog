"use client";

import { useState, useEffect, useCallback } from "react";
import type { GameState } from "@/app/lib/game/type";

const PROGRESS_KEY = "sokoban-progress";
const GAME_STATE_KEY = "sokoban-game-state";

// ============================================
// 关卡进度（已完成关卡列表）
// ============================================

function readCompletedLevels(): number[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Array.isArray(data.completedLevels)) {
      return data.completedLevels.filter((n: unknown) => typeof n === "number");
    }
    return [];
  } catch {
    return [];
  }
}

function saveCompletedLevels(levels: number[]) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ completedLevels: levels }));
  } catch {
    // localStorage 不可用，静默忽略
  }
}

// ============================================
// 游戏状态（当前关卡 + 位置 + 步数 + 历史）
// ============================================

function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

function saveGameState(state: GameState) {
  try {
    // 不保存 victory 状态（刷新后胜利弹窗应该消失）
    const toSave = { ...state, victory: false };
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(toSave));
  } catch {
    // 静默忽略
  }
}

// ============================================
// Hook
// ============================================

export function useSokobanProgress() {
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [savedState, setSavedState] = useState<GameState | null>(null);

  // 客户端挂载后读取 localStorage
  useEffect(() => {
    setCompletedLevels(readCompletedLevels());
    setSavedState(loadGameState());
    setHydrated(true);
  }, []);

  // 标记关卡为已完成
  const markCompleted = useCallback((levelId: number) => {
    setCompletedLevels((prev) => {
      if (prev.includes(levelId)) return prev;
      const next = [...prev, levelId];
      saveCompletedLevels(next);
      return next;
    });
  }, []);

  // 持久化当前游戏状态（每次移动后调用）
  const persistGameState = useCallback((state: GameState) => {
    saveGameState(state);
  }, []);

  return { completedLevels, hydrated, savedState, markCompleted, persistGameState };
}
