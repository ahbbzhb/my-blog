"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import styles from "./TagInput.module.css";

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** 已有标签建议（从其他文章中提取），用于 autocomplete */
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
};

export default function TagInput({
  tags,
  onChange,
  suggestions = [],
  placeholder = "输入标签，回车添加",
  disabled = false,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // 过滤建议：排除已选、匹配输入
  const filtered = suggestions.filter(
    (s) =>
      !tags.includes(s) &&
      s.toLowerCase().includes(input.toLowerCase())
  );
  const showSuggestions = input.length > 0 && filtered.length > 0;

  const addTag = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed || tags.includes(trimmed)) return;
      onChange([...tags, trimmed]);
      setInput("");
      setActiveIndex(-1);
    },
    [tags, onChange]
  );

  const removeTag = useCallback(
    (name: string) => {
      onChange(tags.filter((t) => t !== name));
    },
    [tags, onChange]
  );

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      // 如果有选中的建议项，添加它
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        addTag(filtered[activeIndex]);
      } else if (input.trim()) {
        addTag(input);
      }
      return;
    }

    if (e.key === ",") {
      e.preventDefault();
      addTag(input);
      return;
    }

    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
      return;
    }

    // 上下键移动建议列表
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : 0
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : filtered.length - 1
      );
      return;
    }

    if (e.key === "Escape") {
      setActiveIndex(-1);
      return;
    }
  }

  function handleWrapperClick() {
    inputRef.current?.focus();
  }

  return (
    <div className={styles.wrapper} onClick={handleWrapperClick}>
      {tags.map((tag) => (
        <span key={tag} className={styles.tag}>
          {tag}
          <button
            type="button"
            className={styles.removeBtn}
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            disabled={disabled}
            aria-label={`删除标签 ${tag}`}
          >
            ×
          </button>
        </span>
      ))}

      <div className={styles.inputArea}>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          disabled={disabled}
        />

        {showSuggestions && (
          <div className={styles.suggestions}>
            {filtered.map((s, i) => (
              <button
                key={s}
                type="button"
                className={`${styles.suggestion} ${
                  i === activeIndex ? styles.suggestionActive : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault(); // 防止 input 失焦
                  addTag(s);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
