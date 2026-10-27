import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArticle, getArticles } from "../../api/articles";
import "../../styles/article.css";

const API_ORIGIN = "http://127.0.0.1:8000";

function getImageUrl(path) {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(/^\/+/, "")}`;
}

function getPlainText(html = "") {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getReadTime(content = "") {
  const words = getPlainText(content).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export default function ArticlePage() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadArticle() {
      try {
        setLoading(true);
        setError("");
        setArticle(null);

        // Find the article by slug in the published article list.
        const response = await getArticles();

        const matchingArticle = response.find(
          (item) => item.slug === slug
        );

        if (!matchingArticle) {
          throw new Error("Story not found.");
        }

        // Fetch the complete article using its database ID.
        const fullArticle = await getArticle(matchingArticle.id);

        // Do not display drafts on the public reading page.
        if (
          fullArticle.published !== true ||
          fullArticle.status !== "published"
        ) {
          throw new Error("Story not found.");
        }

        if (!cancelled) {
          setArticle(fullArticle);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load this story.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    function updateProgress() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const percentage =
        scrollableHeight > 0
          ? (window.scrollY / scrollableHeight) * 100
          : 0;

      setProgress(Math.min(100, Math.max(0, percentage)));
    }

    window.addEventListener("scroll", updateProgress, {
      passive: true,
    });

    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
    };
  }, [slug, article]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setProgress(0);
    setCopied(false);
  }, [slug]);

  async function copyArticleLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      window.prompt("Copy this story link:", window.location.href);
    }
  }

  if (loading) {
    return (
      <section className="article-not-found">
        <p>Loading story...</p>
      </section>
    );
  }

  if (error || !article) {
    return (
      <section className="article-not-found">
        <h1>Story not found.</h1>
        <p>{error || "The story may have moved or does not exist."}</p>
        <Link to="/">Return to home</Link>
      </section>
    );
  }

  const excerpt =
    article.subtitle || getPlainText(article.content || "").slice(0, 200);

  const coverImage = getImageUrl(article.cover_image);

  return (
    <>
      <div className="article-progress-track" aria-hidden="true">
        <div
          className="article-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article className="article-page">
        <Link className="article-back" to="/">
          ← Back to stories
        </Link>

        <header className="article-header">
          <span className="article-category">
            {article.category || "Stories"}
          </span>

          <h1>{article.title}</h1>

          {excerpt && (
            <p className="article-excerpt">{excerpt}</p>
          )}

          <div className="article-meta">
            <span>{formatDate(article.created_at)}</span>
            <span aria-hidden="true">·</span>
            <span>{getReadTime(article.content || "")}</span>
          </div>
        </header>

        {coverImage ? (
          <div className="article-cover article-cover-image">
            <img
              src={coverImage}
              alt={`Cover for ${article.title}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ) : (
          <div
            className="article-cover"
            role="img"
            aria-label={`Cover artwork for ${article.title}`}
          >
            <span>{article.category || "Stories"}</span>
          </div>
        )}

        <div className="article-body">
          {article.content ? (
            <div
              className="article-rich-content"
              dangerouslySetInnerHTML={{
                __html: article.content,
              }}
            />
          ) : (
            <p>This story does not have any content yet.</p>
          )}

          <button
            type="button"
            className="article-copy-button"
            onClick={copyArticleLink}
          >
            {copied ? "Link copied!" : "Copy story link"}
          </button>

          <div className="article-endmark" aria-hidden="true">
            ✳
          </div>

          <Link className="article-back-bottom" to="/">
            Explore more stories →
          </Link>
        </div>
      </article>
    </>
  );
}
