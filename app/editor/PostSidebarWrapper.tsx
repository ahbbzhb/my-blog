"use client";

import { usePathname } from "next/navigation";
import PostSidebar from "../components/PostSidebar";

/**
 * 从 URL pathname 提取当前编辑的文章 slug，传给 PostSidebar。
 * 必须在 layout.tsx 的 children 位置使用，用 client component 包裹。
 */
export default function PostSidebarWrapper() {
  const pathname = usePathname();

  // /editor          → undefined（新建页）
  // /editor/my-post  → "my-post"
  const slug =
    pathname === "/editor" ? undefined : pathname.replace("/editor/", "");

  return <PostSidebar currentSlug={slug} variant="full" refreshKey={pathname} />;
}
