# BlogHub

基于 Next.js 16 + Prisma 7 + PostgreSQL 的个人博客。

部署地址：[my-blog.cc](https://my-blog.cc)

## 一键部署

```bash
# 1. 克隆项目
git clone <repo-url> && cd blog

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入真实值

# 3. 启动
docker compose up -d
```

打开 [http://localhost:3000](http://localhost:3000)。

## 功能

- 用户注册 / 登录（NextAuth + Credentials + GitHub OAuth）
- Markdown 文章编写、草稿、发布
- AI 标题/摘要生成（智谱 GLM）
- 文章标签系统（TagInput 输入 + TagList 展示）
- 全文搜索（标题 + 摘要 + 标签）
- 文章评论（登录后评论）
- 文章点赞（toggle 模式，乐观更新）
- 推箱子小游戏（用户主页右侧）
- 响应式布局

## 前置要求

| 依赖 | 用途 |
|------|------|
| Docker + Docker Compose | 一键部署 |
| Node.js 20+ | 本地开发（可选） |
| PostgreSQL | 通过 Docker 自动提供 |

## Vercel 部署

### 环境变量

```
DATABASE_URL       Neon PostgreSQL 连接字符串
NEXTAUTH_URL       https://你的域名
AUTH_SECRET        NextAuth 加密密钥（openssl rand -base64 32）
GITHUB_ID          GitHub OAuth App Client ID
GITHUB_SECRET      GitHub OAuth App Client Secret
OPENAI_API_KEY     智谱 AI API Key
```

### 步骤

1. Fork 项目，在 Vercel 导入
2. 设置上述环境变量
3. 部署
4. GitHub OAuth App 的 callback URL 设为 `https://你的域名/api/auth/callback/github`

## 项目结构

```
app/
├── api/
│   ├── ai/                    # AI 生成 API
│   ├── auth/[...nextauth]/    # NextAuth 认证
│   ├── comments/              # 评论 API
│   ├── likes/                 # 点赞 API
│   └── posts/                 # 文章 API
├── blog/[slug]/               # 文章详情页
├── components/
│   ├── CommentSection         # 评论区
│   ├── EditorForm             # 编辑器表单
│   ├── game/                  # 推箱子游戏
│   ├── LikeButton             # 点赞按钮
│   ├── MarkdownEditor         # Markdown 编辑器
│   ├── Navbar                 # 导航栏
│   ├── PostCard               # 文章卡片
│   ├── PostSidebar            # 文章侧边栏
│   ├── SearchBar              # 搜索栏
│   ├── TagInput               # 标签输入
│   └── TagList                # 标签展示
├── editor/                    # 文章编辑器（新建 + 编辑）
├── hooks/
│   ├── useDraftProtection     # 草稿自动保存
│   └── useSokobanProgress     # 游戏进度
├── lib/
│   ├── ai/                    # AI 客户端
│   ├── api/                   # 客户端 API 请求
│   ├── data.ts                # 数据查询
│   ├── game/                  # 游戏引擎
│   ├── prisma.ts              # Prisma 客户端
│   └── types.ts               # 类型定义
├── login/                     # 登录页
└── u/[username]/              # 用户主页
prisma/
├── schema.prisma              # 数据模型
└── migrations/                # 数据库迁移
```

## 常用命令

```bash
# 查看日志
docker compose logs -f nextjs

# 重建容器（改了依赖或 Dockerfile 时）
docker compose up -d --build

# 数据库迁移（改了 schema.prisma 时）
docker compose exec nextjs npx prisma migrate dev --name <描述>

# Prisma Studio
docker compose exec nextjs npx prisma studio

# 进入数据库
docker exec -it blog_db psql -U bloguser -d blogdb
```
