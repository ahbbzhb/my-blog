"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  console.log(session);

  // 取用户名首字作为头像缩写
  const initial = session?.user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link href="/">My Blog</Link>
      </div>

      <div className="navbar-links">
        {!session ? (
          <>
            <Link href="/login" className="navbar-btn navbar-btn-login">
              登录
            </Link>
            <Link href="/register" className="navbar-btn navbar-btn-register">
              注册
            </Link>
          </>
        ) : (
          <div className="navbar-user">
            <Link
              href={`/u/${session.user?.name}`}
              className="navbar-user-avatar"
            >
              {session.user?.image ? (
                <img src={session.user.image} alt={session.user?.name || ""} />
              ) : (
                initial
              )}
            </Link>
            <Link
              href={`/u/${session.user?.name}`}
              className="navbar-user-name"
            >
              {session.user?.name}
            </Link>
            <Link href="/editor" className="navbar-write-btn">
              写文章
            </Link>
            <button
              className="navbar-logout"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              退出
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
