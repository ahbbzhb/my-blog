import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link href="/">MyBlog</Link>
      </div>

      <div className="navbar-links">
        <Link href="/">Home</Link>
        <Link href="/editor">Editor</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </div>
    </nav>
  );
}