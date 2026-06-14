"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("用户名或密码错误");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      console.error("error");
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.backLink}>
        ← 回到首页
      </Link>

      <h1 className={styles.title}>登录</h1>

      <form className={styles.form} onSubmit={handleLogin}>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.field}>
          <label className={styles.label}>用户名</label>
          <input
            className={styles.input}
            type="text"
            placeholder="请输入用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>密码</label>
          <input
            className={styles.input}
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button className={styles.submitBtn} type="submit" disabled={loading}>
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      <button className={styles.githubBtn}>使用 GitHub 登录</button>

      <p className={styles.footer}>
        没有账号？
        <Link href="/register" className={styles.footerLink}>
          去注册
        </Link>
      </p>
    </main>
  );
}
