import { NextResponse }
from "next/server";

import { prisma }
from "../../../lib/prisma";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: {
      slug: string;
    };
  }
) {
  try {
    const post =
      await prisma.post.findFirst({
        where: {
          slug:
            params.slug,

          published:
            true,
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
  {
    params,
  }: {
    params: {
      slug: string;
    };
  }
) {
  try {
    // 当前登录用户
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

    // 当前用户
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

    // 查文章
    const post =
      await prisma.post.findFirst({
        where: {
          slug:
            params.slug,
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

    // 权限检查
    if (
      post.authorId !==
      user.id
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
    } = body;

    if (
      !title?.trim()
    ) {
      return NextResponse.json({
        success: false,
        message:
          "标题不能为空",
      });
    }

    if (
      !content?.trim()
    ) {
      return NextResponse.json({
        success: false,
        message:
          "正文不能为空",
      });
    }

    const updatedPost =
      await prisma.post.update({
        where: {
          id: post.id,
        },

        data: {
          title:
            title.trim(),

          summary:
            summary?.trim(),

          content:
            content.trim(),
        },
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
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "请先登录" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "用户不存在" },
        { status: 404 }
      );
    }

    const post = await prisma.post.findFirst({
      where: { slug: params.slug },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, message: "文章不存在" },
        { status: 404 }
      );
    }

    if (post.authorId !== user.id) {
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
