import Link from "next/link";
import styles from "./TagList.module.css";

type TagItem = {
  id: number;
  name: string;
};

type TagListProps = {
  tags: TagItem[];
  /** sm 用于卡片等紧凑场景；md 用于文章详情页 */
  size?: "sm" | "md";
};

export default function TagList({ tags, size = "sm" }: TagListProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`${styles.list} ${size === "md" ? styles.md : ""}`}>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/?tag=${encodeURIComponent(tag.name)}`}
          className={styles.tag}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
