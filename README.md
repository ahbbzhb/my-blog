# Blog

基于 Next.js 16 + Prisma 7 + PostgreSQL 的个人博客。

## 一键部署

```bash
# 1. 克隆项目
git clone <repo-url> && cd blog

# 2. 配置环境变量（首次需要）
cp .env.example .env
# 编辑 .env，把 AUTH_SECRET 替换为随机字符串：
#   openssl rand -base64 32

# 3. 启动
docker compose up -d
```

打开 [http://localhost:3000](http://localhost:3000)。

## 功能

- 用户注册 / 登录（NextAuth + Credentials）
- 文章编写（Markdown）、发布、编辑
- 文章评论（登录后评论）
- 文章点赞（toggle 模式，乐观更新）
- 响应式布局

## 前置要求

| 依赖 | 用途 |
|------|------|
| Docker + Docker Compose | 一键部署 |
| Node.js 20+ | 本地开发（可选） |
| PostgreSQL | 通过 Docker 自动提供 |

## 手动部署（不用 Docker）

```bash
cp .env.example .env
# 修改 DATABASE_URL 指向你的 PostgreSQL

npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

## 项目结构

```
app/
├── api/
│   ├── auth/[...nextauth]/  # NextAuth 认证
│   ├── comments/            # 评论 API
│   ├── likes/               # 点赞 API
│   └── posts/               # 文章 API
├── blog/[slug]/             # 文章详情页
├── components/              # 公共组件
│   ├── CommentSection       # 评论区
│   ├── LikeButton           # 点赞按钮
│   └── ...
├── editor/                  # 文章编辑器
├── lib/
│   ├── data.ts              # 数据查询
│   ├── prisma.ts            # Prisma 客户端
│   └── types.ts             # 类型定义
└── login/                   # 登录页
prisma/
├── schema.prisma            # 数据模型
└── migrations/              # 数据库迁移
```

## 常用命令

```bash
# 查看日志
docker compose logs -f nextjs

# 重建容器（改了依赖或 Dockerfile 时）
docker compose up -d --build

# 数据库迁移（改了 schema.prisma 时）
npx prisma migrate dev --name <描述>

# 进入数据库
docker exec -it blog_db psql -U bloguser -d blogdb
```
