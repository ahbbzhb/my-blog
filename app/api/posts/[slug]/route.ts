import { NextResponse }
from "next/server";

import { prisma }
from "../../../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post =
      await prisma.post.findFirst({
        where: { slug },
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

    return NextResponse.json({
      success: true,
      post,
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

import { getServerSession }
from "next-auth";

import { authOptions }
from "../../../auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 当前登录用户
    const session =
      await getServerSession(
        authOptions
      );

    const userId = (session.user as any).id as string;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "请先登录" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // 查文章
    const post =
      await prisma.post.findFirst({
        where: { slug },
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

    // 权限检查
    if (
      post.authorId !==
      userId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "无权限修改此文章",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request.json();

    const {
      title,
      summary,
      content,
      published,
    } = body;

    // 仅在校验传入的字段
    if (title !== undefined && !title?.trim()) {
      return NextResponse.json({ success: false, message: "标题不能为空" });
    }

    if (content !== undefined && !content?.trim()) {
      return NextResponse.json({ success: false, message: "正文不能为空" });
    }

    // 只更新传入的字段
    const data: Record<string, unknown> = {};

    if (title !== undefined) data.title = title.trim();
    if (summary !== undefined) data.summary = summary?.trim();
    if (content !== undefined) data.content = content.trim();
    if (published !== undefined) data.published = published === true;

    const updatedPost =
      await prisma.post.update({
        where: { id: post.id },
        data,
      });

    return NextResponse.json({
      success: true,
      slug:
        updatedPost.slug,
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
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    const userId = (session.user as any).id as string;

    const { slug } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "请先登录" },
        { status: 401 }
      );
    }

    const post = await prisma.post.findFirst({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, message: "文章不存在" },
        { status: 404 }
      );
    }

    if (post.authorId !== userId) {
      return NextResponse.json(
        { success: false, message: "无权限删除此文章" },
        { status: 403 }
      );
    }

    await prisma.post.delete({ where: { id: post.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
