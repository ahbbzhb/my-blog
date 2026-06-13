// ============================================
// Data Layer — Prisma Queries
// ============================================

import { prisma } from "./prisma";
import type { PostData, UserData } from "./types";

// 获取所有已发布的文章（按时间倒序）
export async function getPosts(): Promise<PostData[]> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: { username: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return posts;
}

// 根据 slug 获取单篇文章
export async function getPostBySlug(
  slug: string
): Promise<PostData | null> {
  const post = await prisma.post.findFirst({
    where: { slug },
    include: {
      author: {
        select: { username: true, avatar: true },
      },
    },
  });
  return post;
}

// 根据用户名获取用户信息
export async function getUserByUsername(
  username: string
): Promise<UserData | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatar: true,
      bio: true,
      createdAt: true,
    },
  });
  return user;
}

// 获取某个用户的文章列表
export async function getPostsByUsername(
  username: string
): Promise<PostData[]> {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      author: { username },
    },
    include: {
      author: {
        select: { username: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return posts;
}
