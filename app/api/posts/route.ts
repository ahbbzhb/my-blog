import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { prisma } from "../../lib/prisma";

function slugify(text: string) {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9一-鿿]+/g, "-") // 保留中文字符
    .replace(/(^-|-$)/g, "");

  // 纯中文标题无英文数字时，用 "post" 兜底
  return slug || "post";
}

// 获取当前用户的所有文章（含草稿，供编辑器侧边栏使用）
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "请先登录" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id as string;

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        updatedAt: true,
        tags: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
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
    const { title, summary, content, published, tags } = body;

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
        published: published === true,
        ...(tags?.length
          ? {
              tags: {
                connectOrCreate: tags.map((name: string) => ({
                  where: { name: name.trim() },
                  create: { name: name.trim() },
                })),
              },
            }
          : {}),
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
