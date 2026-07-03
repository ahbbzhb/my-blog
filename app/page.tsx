import { Suspense } from "react";
import { getPosts } from "@/app/lib/data";
import PostCard from "@/app/components/PostCard";
import SearchBar from "@/app/components/SearchBar";
import SokobanGame from "@/app/components/game/SokobanGame";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const posts = await getPosts();
  const { q, tag } = await searchParams;

  // 按标签和标题过滤
  let filtered = posts;
  if (tag) {
    filtered = filtered.filter((p) =>
      p.tags.some((t) => t.name === tag)
    );
  }
  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.summary?.toLowerCase().includes(lower)
    );
  }

  const heading = tag
    ? `标签「${tag}」${q ? ` — "${q}"` : ""}`
    : q
      ? `搜索「${q}」`
      : "最新文章";

  return (
    <div className="homepage-layout">
      {/* ===== 左侧：主内容 ===== */}
      <div className="homepage-main">
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">Welcome to BlogHub</h1>
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>
        </section>

        <section className="post-list">
          <h2 className="post-list-heading">{heading}</h2>

          {filtered.length > 0 ? (
            filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#999", padding: "48px 0" }}>
              没有找到相关文章
            </p>
          )}
        </section>
      </div>

      {/* ===== 右侧：推箱子游戏 ===== */}
      <aside className="homepage-game">
        <SokobanGame />
      </aside>
    </div>
  );
}
