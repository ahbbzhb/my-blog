import { NextResponse }
from "next/server";

import { getServerSession }
from "next-auth";

import { authOptions }
from "../../auth";

import { prisma }
from "../../lib/prisma";

export async function POST(
  request: Request
) {
  try {
    // 1. 获取登录 session
    const session =
      await getServerSession(
        authOptions
      );

    // 未登录
    if (
      !session?.user?.email
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "请先登录",
        },
        {
          status: 401,
        }
      );
    }

    // 2. 获取请求数据
    const body =
      await request.json();

    const {
      postId,
      content,
    } = body;

    // 评论为空
    if (
      !content?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "评论不能为空",
        }
      );
    }

    // 3. 查当前用户
    const user =
      await prisma.user.findUnique({
        where: {
          email:
            session.user
              .email!,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "用户不存在",
        },
        {
          status: 404,
        }
      );
    }

    // 4. 检查文章是否存在
    const post =
      await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message:
            "文章不存在",
        },
        {
          status: 404,
        }
      );
    }

    // 5. 创建评论
    const comment =
      await prisma.comment.create({
        data: {
          content:
            content.trim(),

          authorId:
            user.id,

          postId,
        },

        include: {
          author: {
            select: { username: true, avatar: true },
          },
        },
      });

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "服务器错误",
      },
      {
        status: 500,
      }
    );
  }
}