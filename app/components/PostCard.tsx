import Link from "next/link";
import type { PostData } from "@/app/lib/data";

export default function PostCard({ post }: { post: PostData }) {
  return (
    <article className="post-card">
      <div className="post-card-body">
        <h2 className="post-card-title">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="post-card-summary">{post.summary}</p>
      </div>

      <div className="post-card-meta">
        <Link href={`/u/${post.author.username}`} className="post-card-author">
          {post.author.username}
        </Link>
        <time className="post-card-date" dateTime={post.createdAt}>
          {post.createdAt}
        </time>
        <span className="post-card-views">{post.views} 次阅读</span>
      </div>
    </article>
  );
}
