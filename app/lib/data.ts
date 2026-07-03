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
        select: { id: true, username: true, avatar: true },
      },
      tags: { select: { id: true, name: true } },
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
        select: { id: true, username: true, avatar: true },
      },
      tags: { select: { id: true, name: true } },
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

// 获取文章评论（按时间倒序）
export async function getCommentsByPostId(postId: string) {
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      author: {
        select: { username: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return comments.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));
}

// 获取点赞信息（总数 + 当前用户是否已点赞）
export async function getPostLikeInfo(
  postId: string,
  userId?: string
): Promise<{ count: number; userLiked: boolean }> {
  const [count, existing] = await Promise.all([
    prisma.like.count({ where: { postId } }),
    userId
      ? prisma.like.findUnique({
          where: { userId_postId: { userId, postId } },
        })
      : Promise.resolve(null),
  ]);
  return { count, userLiked: !!existing };
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
        select: { id: true, username: true, avatar: true },
      },
      tags: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return posts;
}
