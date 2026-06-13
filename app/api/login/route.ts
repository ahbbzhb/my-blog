import { prisma } from "../../lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      username,
      password,
    } = body;

    // 校验为空
    if (!username?.trim()) {
      return Response.json({
        success: false,
        message:
          "用户名不能为空",
      });
    }

    if (!password?.trim()) {
      return Response.json({
        success: false,
        message:
          "密码不能为空",
      });
    }

    // 查用户
    const user =
      await prisma.user.findUnique({
        where: { username },
      });

    // 用户不存在
    if (!user) {
      return Response.json({
        success: false,
        message: "用户不存在",
      });
    }

    // 密码错误（TODO: 后续用 bcrypt.compare）
    if (user.password !== password) {
      return Response.json({
        success: false,
        message: "密码错误",
      });
    }

    // 登录成功 — 不返回 password 字段
    const { password: _, ...safeUser } = user;
    return Response.json({
      success: true,
      message: "登录成功",
      user: safeUser,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
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