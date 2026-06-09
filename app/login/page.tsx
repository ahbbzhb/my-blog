"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log({ username, password });
  }

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.backLink}>
        ← 回到首页
      </Link>

      <h1 className={styles.title}>登录</h1>

      <form className={styles.form} onSubmit={handleLogin}>
        <div className={styles.field}>
          <label className={styles.label}>用户名或邮箱</label>
          <input
            className={styles.input}
            type="text"
            placeholder="请输入用户名或邮箱"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          />
        </div>

        <button className={styles.submitBtn} type="submit">
          登录
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
