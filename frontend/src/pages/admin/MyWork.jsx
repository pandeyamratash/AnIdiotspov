
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { getArticles } from "../../api/articles";
import "../../styles/my-work.css";

const categories = [
  "All categories",
  "Blogs",
  "Travelogues",
  "Life Experiences",
  "Poetry",
  "Stories",
  "Reflections",
];

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyWork() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadArticles() {
      try {
        setLoading(true);
        setError("");

        const data = await getArticles({ includeDrafts: true });

        if (!cancelled) {
          setArticles(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load your articles.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadArticles();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = articles.filter((article) => {
      const articleStatus =
        article.published && article.status === "published"
          ? "Published"
          : "Draft";

      const matchesSearch =
        !query ||
        [article.title, article.subtitle, article.category, article.tags]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All categories" || article.category === category;

      const matchesStatus = status === "All" || articleStatus === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }

      if (sort === "alphabetical") {
        return (a.title || "").localeCompare(b.title || "");
      }

      return new Date(b.updated_at || b.created_at || 0) -
        new Date(a.updated_at || a.created_at || 0);
    });
  }, [articles, search, category, status, sort]);

  const publishedCount = articles.filter(
    (article) => article.published && article.status === "published"
  ).length;

  const draftCount = articles.length - publishedCount;

  function openArticle(article) {
    navigate(`/admin/editor?id=${article.id}`);
  }

  return (
    <div className="my-work-page">
      <header className="my-work-header">
        <button
          className="my-work-back"
          type="button"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>

        <div className="my-work-header-right">
          <span>An idiots pov</span>
          <button
            className="my-work-write-button"
            type="button"
            onClick={() => navigate("/admin/editor")}
          >
            <Plus size={16} />
            Write a story
          </button>
        </div>
      </header>

      <main className="my-work-main">
        <section className="my-work-intro">
          <p className="my-work-eyebrow">YOUR PERSONAL LIBRARY</p>
          <h1>Browse your work.</h1>
          <p className="my-work-description">
            Every story, thought, memory and unfinished idea — all in one place.
          </p>
        </section>

        <section className="my-work-stats" aria-label="Article statistics">
          <div>
            <span>Total articles</span>
            <strong>{articles.length}</strong>
          </div>

          <div>
            <span>Published</span>
            <strong>{publishedCount}</strong>
          </div>

          <div>
            <span>Drafts</span>
            <strong>{draftCount}</strong>
          </div>
        </section>

        <section className="my-work-library">
          <div className="my-work-library-heading">
            <div>
              <p className="my-work-eyebrow">THE COLLECTION</p>
              <h2>Your stories</h2>
            </div>

            <span className="my-work-count">
              {filteredArticles.length}{" "}
              {filteredArticles.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <div className="my-work-filters">
            <label className="my-work-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search stories, tags..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Drafts</option>
            </select>

            <select
              aria-label="Sort articles"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="recent">Recently updated</option>
              <option value="oldest">Oldest first</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {loading && (
            <div className="my-work-feedback">
              <BookOpen size={24} />
              <p>Gathering your stories...</p>
            </div>
          )}

          {!loading && error && (
            <div className="my-work-feedback">
              <p>{error}</p>
              <button type="button" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredArticles.length === 0 && (
            <div className="my-work-empty">
              <div className="my-work-empty-icon">
                <BookOpen size={26} />
              </div>

              <h3>
                {articles.length === 0
                  ? "Your story starts here."
                  : "Nothing found this time."}
              </h3>

              <p>
                {articles.length === 0
                  ? "Create your first entry and it will find a home in this collection."
                  : "Try another search or change your filters."}
              </p>

              {articles.length === 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/admin/editor")}
                >
                  <Plus size={16} />
                  Write your first story
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredArticles.length > 0 && (
            <div className="my-work-list">
              {filteredArticles.map((article) => {
                const isPublished =
                  article.published && article.status === "published";

                return (
                  <button
                    className="my-work-item"
                    type="button"
                    key={article.id}
                    onClick={() => openArticle(article)}
                  >
                    <div className="my-work-item-icon">
                      <FileText size={21} strokeWidth={1.6} />
                    </div>

                    <div className="my-work-item-info">
                      <h3>{article.title || "Untitled story"}</h3>

                      {article.subtitle && (
                        <p className="my-work-item-subtitle">
                          {article.subtitle}
                        </p>
                      )}

                      <div className="my-work-item-meta">
                        <span>{article.category || "Uncategorised"}</span>
                        <span className="my-work-meta-dot">·</span>
                        <span>{formatDate(article.updated_at || article.created_at)}</span>
                      </div>

                      {article.tags && (
                        <p className="my-work-item-tags">{article.tags}</p>
                      )}
                    </div>

                    <span
                      className={`my-work-status ${
                        isPublished ? "published" : "draft"
                      }`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>

                    <ArrowUpRight
                      className="my-work-item-arrow"
                      size={19}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <footer className="my-work-footer">
          <span>AN IDIOTS POV</span>
          <p>Not everything has to be finished to be worth keeping.</p>
        </footer>
      </main>
    </div>
  );
}
