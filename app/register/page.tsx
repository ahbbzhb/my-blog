"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }

    console.log({ username, email, password });
  }

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.backLink}>
        ← 回到首页
      </Link>

      <h1 className={styles.title}>注册</h1>

      <form className={styles.form} onSubmit={handleRegister}>
        <div className={styles.field}>
          <label className={styles.label}>用户名</label>
          <input
            className={styles.input}
            type="text"
            placeholder="请输入用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>邮箱</label>
          <input
            className={styles.input}
            type="email"
            placeholder="请输入邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <div className={styles.field}>
          <label className={styles.label}>确认密码</label>
          <input
            className={styles.input}
            type="password"
            placeholder="请再次输入密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.submitBtn} type="submit">
          注册
        </button>
      </form>

      <button className={styles.githubBtn}>使用 GitHub 注册</button>

      <p className={styles.footer}>
        已有账号？
        <Link href="/login" className={styles.footerLink}>
          去登录
        </Link>
      </p>
    </main>
  );
}
