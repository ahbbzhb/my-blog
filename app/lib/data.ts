// ============================================
// Mock Data
// Phase 1: 纯静态假数据
// Phase 3: 替换为 Prisma 查询
// ============================================

import type {
  PostData,
  UserData,
} from "./types";

// 模拟文章列表（多人平台）
export function getPosts(): PostData[] {
  return [
    {
      id: "1",
      title: "搭建个人博客的完整指南",
      slug: "how-to-build-a-blog",
      summary: "从零开始，用 Next.js + Prisma + Docker 搭建一个现代化的个人博客网站，涵盖前端、后端和部署。",
      content: "学习从 mock data 读取文章",
      published: true,
      views: 1280,
      createdAt: new Date("2026-05-20"),
      author: { username: "hongbo", avatar: null },
    },
    {
      id: "2",
      title: "为什么我选择 TypeScript",
      slug: "why-i-chose-typescript",
      summary: "TypeScript 的静态类型系统如何在大型项目中减少 bug、提升开发体验，以及我的一些实践心得。",
      content: `
这是我的第一篇博客。

在这篇文章中，我们会从零开始，
使用 Next.js、Prisma 和 Docker
搭建一个现代博客系统。

内容包括：

1. 项目初始化
2. 路由设计
3. 数据库设计
4. 登录认证
`,
      published: true,
      views: 856,
      createdAt: new Date("2026-05-15"),
      author: { username: "alice", avatar: null },
    },
    {
      id: "3",
      title: "Docker Compose 入门教程",
      slug: "docker-compose-getting-started",
      summary: "手把手教你用 Docker Compose 管理多容器应用，以博客项目的开发环境为例。",
      content: "",
      published: true,
      views: 2103,
      createdAt: new Date("2026-05-10"),
      author: { username: "bob", avatar: null },
    },
    {
      id: "4",
      title: "CSS Grid 布局实战技巧",
      slug: "css-grid-practical-tips",
      summary: "快速掌握 CSS Grid 的核心概念，通过实际案例学会构建灵活的响应式布局。",
      content: "",
      published: true,
      views: 672,
      createdAt: new Date("2026-05-05"),
      author: { username: "hongbo", avatar: null },
    },
    {
      id: "5",
      title: "Rust 所有权机制浅析",
      slug: "rust-ownership-basics",
      summary: "用通俗易懂的方式理解 Rust 的所有权、借用和生命周期，附代码示例对比。",
      content: "",
      published: true,
      views: 3401,
      createdAt: new Date("2026-05-01"),
      author: { username: "alice", avatar: null },
    },
  ];
}

// 根据 slug 获取单篇文章
export function getPostBySlug(slug: string): PostData | undefined {
  return getPosts().find((post) => post.slug === slug);
}

// 模拟用户信息
export function getUserByUsername(username: string): UserData | undefined {
  const users: UserData[] = [
    {
      id: "u1",
      username: "hongbo",
      avatar: null,
      bio: "全栈开发者，热爱开源。写博客记录学习过程。",
      createdAt: new Date("2026-05-21"),
    },
    {
      id: "u2",
      username: "alice",
      avatar: null,
      bio: "前端工程师，TypeScript 和 Rust 爱好者。",
      createdAt: new Date("2026-06-03"),
    },
    {
      id: "u3",
      username: "bob",
      avatar: null,
      bio: "DevOps 工程师，专注于容器化和自动化部署。",
      createdAt: new Date("2026-06-07"),
    },
  ];
  return users.find((user) => user.username === username);
}

// 获取某个用户的文章列表
export function getPostsByUsername(username: string): PostData[] {
  return getPosts().filter((post) => post.author.username === username);
}
