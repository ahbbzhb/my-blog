import { prisma } from "../../lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      username,
      email,
      password,
    } = body;

    // 用户名为空
    if (!username?.trim()) {
      return Response.json({
        success: false,
        message:
          "用户名不能为空",
      });
    }

    // 邮箱为空
    if (!email?.trim()) {
      return Response.json({
        success: false,
        message:
          "邮箱不能为空",
      });
    }

    // 密码长度
    if (password.length < 6) {
      return Response.json({
        success: false,
        message:
          "密码至少 6 位",
      });
    }

    // 查用户名是否存在
    const existingUsername =
      await prisma.user.findUnique({
        where: {
          username,
        },
      });

    if (existingUsername) {
      return Response.json({
        success: false,
        message:
          "用户名已存在",
      });
    }

    // 查邮箱是否存在
    const existingEmail =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingEmail) {
      return Response.json({
        success: false,
        message:
          "邮箱已存在",
      });
    }

    // 写入数据库
    const user =
      await prisma.user.create({
        data: {
          username,
          email,
          password,
        },
      });

    // 不返回 password 字段
    const { password: _, ...safeUser } = user;
    return Response.json({
      success: true,
      message: "注册成功",
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