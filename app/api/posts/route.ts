import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { prisma } from "../../lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 未登录
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "请先登录" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id as string;

    const body = await request.json();
    const { title, summary, content } = body;

    // 校验
    if (!title?.trim()) {
      return NextResponse.json({ success: false, message: "标题不能为空" });
    }

    if (!content?.trim()) {
      return NextResponse.json({ success: false, message: "正文不能为空" });
    }

    // 生成唯一 slug
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let suffix = 1;

    while (
      await prisma.post.findUnique({
        where: { authorId_slug: { authorId: userId, slug } },
      })
    ) {
      suffix++;
      slug = baseSlug + "-" + suffix;
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        summary: summary?.trim(),
        content: content.trim(),
        slug,
        authorId: userId,
        published: true,
      },
    });

    return NextResponse.json({ success: true, slug: post.slug });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
