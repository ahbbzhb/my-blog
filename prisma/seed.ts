import "dotenv/config";
import { PrismaClient }
from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

console.log(process.env.DATABASE_URL);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // 清空旧数据（开发阶段方便重复执行）
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 创建用户
  const hongbo =
    await prisma.user.create({
      data: {
        username: "hongbo",
        email: "hongbo@test.com",
        password: "123456",
        bio: "全栈开发者，热爱开源。写博客记录学习过程。",
      },
    });

  const alice =
    await prisma.user.create({
      data: {
        username: "alice",
        email: "alice@test.com",
        password: "123456",
        bio: "前端工程师，TypeScript 和 Rust 爱好者。",
      },
    });

  const bob =
    await prisma.user.create({
      data: {
        username: "bob",
        email: "bob@test.com",
        password: "123456",
        bio: "DevOps 工程师，专注于容器化和自动化部署。",
      },
    });

  // 创建文章
  await prisma.post.createMany({
    data: [
      {
        title:
          "搭建个人博客的完整指南",
        slug:
          "how-to-build-a-blog",
        summary:
          "从零开始，用 Next.js + Prisma + Docker 搭建现代博客。",
        content:
          "这里是博客正文内容……",
        published: true,
        views: 1280,
        authorId: hongbo.id,
      },

      {
        title:
          "为什么我选择 TypeScript",
        slug:
          "why-i-chose-typescript",
        summary:
          "聊聊 TS 的类型系统。",
        content:
          "这里是文章正文……",
        published: true,
        views: 856,
        authorId: alice.id,
      },

      {
        title:
          "Docker Compose 入门教程",
        slug:
          "docker-compose-getting-started",
        summary:
          "手把手管理多容器。",
        content:
          "Docker 正文……",
        published: true,
        views: 2103,
        authorId: bob.id,
      },
    ],
  });

  console.log(
    "Seed data inserted 🌱"
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });