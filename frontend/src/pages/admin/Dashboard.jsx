
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  FilePenLine,
  BookOpen,
  Clock3,
  Plus,
  ArrowUpRight,
  PenLine,
  LogOut,
} from "lucide-react";

import { getArticles } from "../../api/articles";
import { logoutAdmin } from "../../api/auth";
import "../../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadArticles() {
      try {
        setLoading(true);
        setError("");

        const data = await getArticles({ includeDrafts: true });

        if (!cancelled) {
          setEntries(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load articles.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadArticles();

    return () => {
      cancelled = true;
    };
  }, []);

  const published = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.published === true || entry.status === "published"
      ),
    [entries]
  );

  const drafts = useMemo(
    () =>
      entries.filter(
        (entry) =>
          !(entry.published === true || entry.status === "published")
      ),
    [entries]
  );

  const totalWords = useMemo(
    () =>
      entries.reduce((sum, entry) => {
        const text = (entry.content || "")
          .replace(/<[^>]*>/g, " ")
          .trim();

        return sum + (text.match(/\S+/g) || []).length;
      }, 0),
    [entries]
  );

  const recent = useMemo(
    () =>
      [...entries]
        .sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at || 0).getTime() -
            new Date(a.updated_at || a.created_at || 0).getTime()
        )
        .slice(0, 5),
    [entries]
  );

  function formatDate(entry) {
    const value = entry.updated_at || entry.created_at || entry.date;

    if (!value) return "No date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "No date";

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function browseWork() {
    navigate("/admin/work");
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logoutAdmin();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      // Always clear the local session and return to the login page.
      navigate("/admin/login", { replace: true });
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">YOUR WRITING SPACE</span>
          <h1>Good things begin with a blank page.</h1>
          <p>
            Welcome to your corner of the internet. What are we writing today?
          </p>
        </div>

        <div className="dashboard-heading-actions">
          <button
            className="dashboard-logout-button"
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={17} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>

          <button
            className="dashboard-primary"
            type="button"
            onClick={() => navigate("/admin/editor")}
          >
            <Plus size={17} />
            New article
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-message" role="alert">
          {error}
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      <section className="dashboard-stats">
        <div className="dashboard-stat">
          <span className="stat-icon terracotta">
            <FileText />
          </span>
          <span className="stat-label">Total articles</span>
          <strong>{loading ? "—" : entries.length}</strong>
          <small>Across all categories</small>
        </div>

        <div className="dashboard-stat">
          <span className="stat-icon teal">
            <BookOpen />
          </span>
          <span className="stat-label">Published</span>
          <strong>{loading ? "—" : published.length}</strong>
          <small>Stories out in the world</small>
        </div>

        <div className="dashboard-stat">
          <span className="stat-icon plum">
            <FilePenLine />
          </span>
          <span className="stat-label">Drafts</span>
          <strong>{loading ? "—" : drafts.length}</strong>
          <small>Ideas still taking shape</small>
        </div>

        <div className="dashboard-stat">
          <span className="stat-icon gold">
            <PenLine />
          </span>
          <span className="stat-label">Words written</span>
          <strong>{loading ? "—" : totalWords.toLocaleString()}</strong>
          <small>Across your article library</small>
        </div>
      </section>

      <section className="dashboard-lower">
        <div className="dashboard-panel recent-panel">
          <div className="panel-heading">
            <div>
              <span className="dashboard-eyebrow">YOUR WORK</span>
              <h2>Recently touched</h2>
            </div>

            <button
              className="dashboard-text-button"
              type="button"
              onClick={browseWork}
            >
              All articles <ArrowUpRight size={15} />
            </button>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              <p>Loading your articles...</p>
            </div>
          ) : recent.length ? (
            <div className="recent-list">
              {recent.map((entry) => {
                const isPublished =
                  entry.published === true ||
                  entry.status === "published";

                return (
                  <div className="recent-entry" key={entry.id}>
                    <div className="recent-entry-icon">
                      <FileText size={19} />
                    </div>

                    <div className="recent-entry-info">
                      <strong>{entry.title || "Untitled"}</strong>
                      <span>
                        {entry.category || "Uncategorised"} ·{" "}
                        {formatDate(entry)}
                      </span>
                    </div>

                    <span
                      className={`entry-status ${
                        isPublished ? "is-published" : ""
                      }`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>

                    <button
                      className="recent-edit"
                      type="button"
                      aria-label={`Edit ${entry.title || "article"}`}
                      onClick={() =>
                        navigate(`/admin/editor?id=${entry.id}`)
                      }
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="dashboard-empty">
              <BookOpen size={28} />
              <p>Your first story is waiting to be written.</p>
              <button
                type="button"
                onClick={() => navigate("/admin/editor")}
              >
                Start writing
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-side">
          <div className="dashboard-panel quick-panel">
            <span className="dashboard-eyebrow">MAKE SOMETHING</span>
            <h2>A little inspiration.</h2>
            <p>
              A thought, a place, a memory. Give it a title and see where it
              goes.
            </p>

            <button
              className="quick-action"
              type="button"
              onClick={() => navigate("/admin/editor")}
            >
              <span>
                <PenLine size={17} />
              </span>
              <span>
                <strong>Write a story</strong>
                <small>Start with a blank page</small>
              </span>
              <ArrowUpRight size={17} />
            </button>

            <button
              className="quick-action"
              type="button"
              onClick={browseWork}
            >
              <span>
                <BookOpen size={17} />
              </span>
              <span>
                <strong>Browse your work</strong>
                <small>Find a story to revisit</small>
              </span>
              <ArrowUpRight size={17} />
            </button>
          </div>

          <div className="dashboard-note">
            <Clock3 size={18} />
            <div>
              <strong>Progress, not perfection.</strong>
              <p>Every unfinished paragraph is a beginning.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}