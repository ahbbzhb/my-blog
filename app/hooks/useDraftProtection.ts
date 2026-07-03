"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface DraftData {
  title: string;
  summary: string;
  content: string;
  tags: string[];
  updatedAt: number;
}

function getStorageKey(slug: string) {
  return `draft:${slug}`;
}

/**
 * 同步读取 localStorage 中的草稿，适合在 useState 初始化器中使用。
 * 用法：useState(() => loadDraftSync("draft:new")?.title ?? "")
 */
export function loadDraftSync(slug: string): DraftData | null {
  const key = `draft:${slug}`;
  return readDraft(key);
}

/** 返回 localStorage 中保存的草稿数据，没有则返回 null */
function readDraft(key: string): DraftData | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as DraftData;
    // 基本校验：必须包含这些字段
    if (
      typeof data.title === "string" &&
      typeof data.summary === "string" &&
      typeof data.content === "string"
    ) {
      // tags 向后兼容：旧草稿没有 tags 字段时默认空数组
      if (!Array.isArray(data.tags)) data.tags = [];
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

export function useDraftProtection(slug: string) {
  const key = getStorageKey(slug);

  // ---- 恢复草稿 ----
  const [restoredData, setRestoredData] = useState<DraftData | null>(null);
  const [isRestored, setIsRestored] = useState(false);
  const didRestore = useRef(false);

  useEffect(() => {
    // 只在挂载时执行一次，防止覆盖用户正在编辑的内容
    if (didRestore.current) return;
    didRestore.current = true;

    const draft = readDraft(key);
    if (draft) {
      setRestoredData(draft);
      setIsRestored(true);
      // 3 秒后隐藏恢复提示
      setTimeout(() => setIsRestored(false), 3000);
    }
  }, [key]);

  // ---- 持久化到 localStorage（防抖 1 秒）----
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    (data: { title: string; summary: string; content: string; tags: string[] }) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(
            key,
            JSON.stringify({ ...data, updatedAt: Date.now() })
          );
        } catch {
          // localStorage 满或不可用，静默忽略
        }
      }, 1000);
    },
    [key]
  );

  // ---- 清除草稿 ----
  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      localStorage.removeItem(key);
    } catch {}
    setIsRestored(false);
    setRestoredData(null);
  }, [key]);

  // ---- 卸载时清除定时器 ----
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { restoredData, isRestored, persist, clear };
}
