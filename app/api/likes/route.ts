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
    const session =
      await getServerSession(
        authOptions
      );

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

    const body =
      await request.json();

    const {
      postId,
    } = body;

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

    // 是否已点赞
    const existingLike =
      await prisma.like.findUnique({
        where: {
          userId_postId:
            {
              userId:
                user.id,

              postId,
            },
        },
      });

    // 已点赞 → 取消
    if (
      existingLike
    ) {
      await prisma.like.delete({
        where: {
          id:
            existingLike.id,
        },
      });

      return NextResponse.json({
        success: true,
        liked: false,
      });
    }

    // 未点赞 → 创建
    await prisma.like.create({
      data: {
        userId:
          user.id,

        postId,
      },
    });

    return NextResponse.json({
      success: true,
      liked: true,
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