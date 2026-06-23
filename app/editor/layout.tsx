import PostSidebarWrapper from "./PostSidebarWrapper";
import styles from "./layout.module.css";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <PostSidebarWrapper />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
