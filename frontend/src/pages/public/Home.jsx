import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getArticles } from "../../api/articles";
const defaultCategories = ["All", "Travelogues", "Life", "Poetry", "Stories"];

const artwork = {
  hills: ["#d9d6cf", "#8c8b86", "#f2efe6"],
  sea: ["#cfd8dc", "#7d8a90", "#f5f0e0"],
  dusk: ["#d8cfc9", "#7a6f6a", "#efe3d3"],
  mist: ["#dcdcdc", "#9a9a9a", "#fafafa"],
};

function StoryArtwork({ type, imageUrl }) {
  const [background, hills, sun] = artwork[type] || artwork.hills;

  if (imageUrl) {
    return (
      <div className="reader-story-art">
        <img
          src={
            imageUrl.startsWith("http") || imageUrl.startsWith("data:")
              ? imageUrl
              : `http://127.0.0.1:8000/${imageUrl.replace(/^\/+/, "")}`
          }
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="reader-story-art"
      style={{ background }}
      aria-hidden="true"
    >
      <span className="reader-art-sun" style={{ background: sun }} />
      <svg viewBox="0 0 900 600" preserveAspectRatio="none">
        <path
          d="M0 420 L170 250 L300 380 L470 190 L650 400 L780 300 L900 400 V600 H0Z"
          fill={hills}
        />
        <path
          d="M0 500 Q250 430 450 490 T900 470 V600 H0Z"
          fill="#000"
          opacity=".12"
        />
      </svg>
    </div>
  );
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
    month: "short",
    year: "numeric",
  });
}

function getReadTime(content = "") {
  const words = getPlainText(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function mapArticle(article, index) {
  const plainContent = getPlainText(article.content || "");
  const excerpt =
    getPlainText(article.subtitle || "") ||
    plainContent.slice(0, 180) ||
    "A story waiting to be explored.";

  const artworkTypes = ["hills", "sea", "mist", "dusk"];

  return {
    id: article.id,
    slug: article.slug,
    title: article.title || "Untitled",
    category: article.category || "Stories",
    date: article.created_at,
    readTime: getReadTime(article.content),
    excerpt:
      plainContent.length > 180 && !article.subtitle
        ? `${plainContent.slice(0, 177).trim()}...`
        : excerpt,
    imageUrl: article.cover_image || "",
    image: artworkTypes[index % artworkTypes.length],
    location: "",
  };
}

export default function Home() {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const query = (params.get("q") || "").trim().toLowerCase();

  const path = decodeURIComponent(location.pathname);
  const routeCategory = path.startsWith("/categories/")
    ? path.split("/").pop()
    : "All";

  const initialCategory = defaultCategories.find(
    (category) => category.toLowerCase() === routeCategory.toLowerCase()
  ) || "All";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOrder, setSortOrder] = useState("newest");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadArticles() {
      try {
        setLoading(true);
        setError("");

        // By default, the API returns published articles only.
        const data = await getArticles();

        if (!cancelled) {
          const mapped = Array.isArray(data)
            ? data.map(mapArticle)
            : [];

          setArticles(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Could not load stories. Please check that the backend is running."
          );
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

  const categories = useMemo(() => {
    const articleCategories = articles
      .map((article) => article.category)
      .filter(Boolean);

    return [
      "All",
      ...new Set([...defaultCategories.slice(1), ...articleCategories]),
    ];
  }, [articles]);

  const visibleStories = useMemo(() => {
    return articles
      .filter((story) => {
        const matchesCategory =
          selectedCategory === "All" ||
          story.category.toLowerCase() === selectedCategory.toLowerCase();

        const searchableText = [
          story.title,
          story.category,
          story.excerpt,
          story.location || "",
        ]
          .join(" ")
          .toLowerCase();

        return matchesCategory && searchableText.includes(query);
      })
      .sort((a, b) => {
        const firstDate = new Date(a.date || 0).getTime();
        const secondDate = new Date(b.date || 0).getTime();

        return sortOrder === "newest"
          ? secondDate - firstDate
          : firstDate - secondDate;
      });
  }, [articles, selectedCategory, sortOrder, query]);

  const featuredStory =
    selectedCategory === "All" && !query ? visibleStories[0] : null;

  return (
    <div className="reader-home">
      <section className="reader-intro">
        <p className="reader-eyebrow">NOTES FROM AN ORDINARY LIFE</p>
        <h1>Stories from a life still being figured out.</h1>
        <p className="reader-intro-copy">
          Travelogues, little observations, poetry, and things worth
          remembering.
        </p>
      </section>

      {featuredStory && (
        <section className="reader-featured">
          <Link
            to={`/articles/${featuredStory.slug}`}
            className="reader-featured-image"
          >
            <StoryArtwork
              type={featuredStory.image}
              imageUrl={featuredStory.imageUrl}
            />
          </Link>

          <div className="reader-featured-content">
            <p className="reader-eyebrow">FEATURED STORY</p>
            <p className="reader-story-category">
              {featuredStory.category}
              {featuredStory.location && ` · ${featuredStory.location}`}
            </p>
            <h2>
              <Link to={`/articles/${featuredStory.slug}`}>
                {featuredStory.title}
              </Link>
            </h2>
            <p>{featuredStory.excerpt}</p>
            <Link
              className="reader-text-link"
              to={`/articles/${featuredStory.slug}`}
            >
              Read the story →
            </Link>
          </div>
        </section>
      )}

      <section className="reader-stories-section">
        <div className="reader-stories-heading">
          <div>
            <p className="reader-eyebrow">THE COLLECTION</p>
            <h2>{query ? "Search results" : "Browse stories"}</h2>
          </div>

          <label className="reader-sort">
            <span>Sort:</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>

        <div className="reader-category-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                selectedCategory === category
                  ? "reader-filter active"
                  : "reader-filter"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {query && (
          <p className="reader-results-label">
            Results for “{params.get("q")}”
          </p>
        )}

        {loading && (
          <div className="reader-empty-state">
            <p>Loading stories...</p>
          </div>
        )}

        {!loading && error && (
          <div className="reader-empty-state" role="alert">
            <h3>Stories couldn't be loaded</h3>
            <p>{error}</p>
            <button
              type="button"
              className="reader-filter"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="reader-story-grid">
              {visibleStories.map((story) => (
                <article className="reader-story-card" key={story.id}>
                  <Link
                    to={`/articles/${story.slug}`}
                    className="reader-story-image"
                    aria-label={`Read ${story.title}`}
                  >
                    <StoryArtwork
                      type={story.image}
                      imageUrl={story.imageUrl}
                    />
                  </Link>

                  <p className="reader-story-category">{story.category}</p>

                  <h3>
                    <Link to={`/articles/${story.slug}`}>
                      {story.title}
                    </Link>
                  </h3>

                  <p className="reader-story-excerpt">{story.excerpt}</p>

                  <p className="reader-story-meta">
                    {formatDate(story.date)}
                    {" · "}
                    {story.readTime} min read
                  </p>
                </article>
              ))}
            </div>

            {visibleStories.length === 0 && (
              <div className="reader-empty-state">
                <h3>No stories found</h3>
                <p>
                  {articles.length === 0
                    ? "Your published stories will appear here once you publish one."
                    : "Try another search or choose a different category."}
                </p>
                <button
                  type="button"
                  className="reader-filter"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSortOrder("newest");
                    window.history.replaceState(null, "", "/");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
