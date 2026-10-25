
import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../styles/public.css";

export default function PublicLayout() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/?q=${encodeURIComponent(value)}` : "/");
  }

  return (
    <div className="reader-shell">
      <header className="reader-header">
        <Link className="reader-brand" to="/">
          An idiots pov
        </Link>

        <nav className="reader-nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/stories">Stories</Link>
          <Link to="/categories/Travelogues">Travelogues</Link>
          <Link to="/categories/Life">Life</Link>
          <Link to="/categories/Poetry">Poetry</Link>
          <Link to="/about">About</Link>
        </nav>

        <div className="reader-header-actions">
          <form className="reader-search" onSubmit={handleSearch}>
            <input
              type="search"
              aria-label="Search stories"
              placeholder="Search..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>

          <Link className="reader-write-link" to="/admin/login">
            Write
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      
<footer className="reader-footer">
  <div className="reader-footer-links">
    <Link to="/about">About</Link>
    <Link to="/contact">Contact</Link>
    <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
      Instagram
    </a>
    <a href="https://twitter.com/" target="_blank" rel="noreferrer">
      Twitter
    </a>
  </div>

  <span>© {new Date().getFullYear()} An idiots pov</span>
</footer>

    </div>
  );
}
