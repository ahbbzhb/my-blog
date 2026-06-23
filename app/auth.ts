import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "./lib/prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        username: {
          label: "Username",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username as string,
          },
        });

        if (!user || !user.password) {
          // user.password 为 null 表示这是 GitHub 用户，不能用密码登录
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!isValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.username,
          email: user.email,
        };
      },
    }),

    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // GitHub 登录必须有邮箱
      if (account?.provider === "github") {
        const email = (profile as any)?.email || user.email;
        if (!email) {
          console.error("GitHub 账号未提供邮箱");
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        if (account?.provider === "github") {
          const email = (profile as any)?.email || user.email;
          const githubLogin =
            (profile as any)?.login || email?.split("@")[0];
          const avatar =
            (profile as any)?.avatar_url || user.image;

          // 查找已有用户
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          if (dbUser) {
            // 同步 provider 和 GitHub 头像
            const updates: Record<string, string> = {};
            if (!dbUser.provider) updates.provider = "github";
            if (avatar && dbUser.avatar !== avatar) updates.avatar = avatar;
            if (Object.keys(updates).length > 0) {
              dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: updates,
              });
            }
          } else {
            // 新用户：处理用户名冲突
            let username = githubLogin;
            const conflict = await prisma.user.findUnique({
              where: { username },
            });
            if (conflict) username = `${githubLogin}_gh`;

            dbUser = await prisma.user.create({
              data: {
                email,
                username,
                provider: "github",
                avatar,
              },
            });
          }

          token.username = dbUser.username;
          token.id = dbUser.id;
          token.picture = dbUser.avatar;
        } else {
          // credentials 登录
          token.username = user.name;
          token.id = user.id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.username as string;
        (session.user as any).id = token.id as string;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.AUTH_SECRET,
};

export default NextAuth(authOptions);
