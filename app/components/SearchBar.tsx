"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./SearchBar.module.css";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("q") || "");
  const activeTag = searchParams.get("tag") || "";

  const isEmpty = !input.trim() && !activeTag;
  const placeholder = isEmpty
    ? "输入你想找的内容..."
    : "输入你想找的内容...";

  const doSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (input.trim()) params.set("q", input.trim());
    if (activeTag) params.set("tag", activeTag);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }, [input, activeTag, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch();
  }

  function handleClearTag() {
    const params = new URLSearchParams();
    if (input.trim()) params.set("q", input.trim());
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  function handleClearAll() {
    setInput("");
    router.push("/");
  }

  const showClear = input.trim() || activeTag;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputWrap}>
        <input
          className={styles.input}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
        />
        {showClear && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClearAll}
          >
            ×
          </button>
        )}
      </div>

      {activeTag && (
        <span className={styles.tagChip}>
          标签: {activeTag}
          <button
            type="button"
            className={styles.tagRemove}
            onClick={handleClearTag}
          >
            ×
          </button>
        </span>
      )}

      <button type="submit" className={styles.btn}>
        搜索
      </button>
    </form>
  );
}
