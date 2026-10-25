
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const stories = [
  {
    slug: "the-last-bus-to-hampi",
    title: "The Last Bus to Hampi",
    category: "Travelogues",
    location: "Hampi, India",
    date: "2026-09-14",
    readTime: 6,
    excerpt:
      "I missed the bus by four minutes. It turned out to be the best thing that happened all year.",
    image: "hills",
    featured: true,
  },
  {
    slug: "on-being-slightly-wrong",
    title: "On Being Slightly Wrong, Mostly Forever",
    category: "Life",
    date: "2026-08-29",
    readTime: 4,
    excerpt:
      "Some thoughts on uncertainty, changing your mind, and learning to live with unfinished answers.",
    image: "sea",
  },
  {
    slug: "a-room-with-no-clock",
    title: "A Room With No Clock",
    category: "Life",
    date: "2026-08-02",
    readTime: 5,
    excerpt:
      "A quiet room, a slower afternoon, and the strange feeling of forgetting what time it is.",
    image: "mist",
  },
  {
    slug: "monsoon-letter",
    title: "Monsoon Letter",
    category: "Poetry",
    date: "2026-07-20",
    readTime: 1,
    excerpt:
      "A small letter to the rain, the streets, and everything the clouds bring back.",
    image: "dusk",
  },
  {
    slug: "things-i-learned-from-a-bad-map",
    title: "Things I Learned From a Bad Map",
    category: "Stories",
    date: "2026-07-04",
    readTime: 3,
    excerpt:
      "Getting lost has a way of showing you things that the shortest route never could.",
    image: "hills",
  },
];

const categories = ["All", "Travelogues", "Life", "Poetry", "Stories"];

const artwork = {
  hills: ["#d9d6cf", "#8c8b86", "#f2efe6"],
  sea: ["#cfd8dc", "#7d8a90", "#f5f0e0"],
  dusk: ["#d8cfc9", "#7a6f6a", "#efe3d3"],
  mist: ["#dcdcdc", "#9a9a9a", "#fafafa"],
};

function StoryArtwork({ type }) {
  const [background, hills, sun] = artwork[type] || artwork.hills;

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

export default function Home() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = (params.get("q") || "").trim().toLowerCase();

  const path = decodeURIComponent(location.pathname);
  const routeCategory = path.startsWith("/categories/")
    ? path.split("/").pop()
    : "All";

  const initialCategory = categories.some(
    (category) => category.toLowerCase() === routeCategory.toLowerCase()
  )
    ? categories.find(
        (category) =>
          category.toLowerCase() === routeCategory.toLowerCase()
      )
    : "All";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOrder, setSortOrder] = useState("newest");

  const visibleStories = useMemo(() => {
    return stories
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
      .sort((a, b) =>
        sortOrder === "newest"
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date)
      );
  }, [selectedCategory, sortOrder, query]);

  const featuredStory = stories.find((story) => story.featured);

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

      {!query && selectedCategory === "All" && featuredStory && (
        <section className="reader-featured">
          <Link
            to={`/articles/${featuredStory.slug}`}
            className="reader-featured-image"
          >
            <StoryArtwork type={featuredStory.image} />
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

        <div className="reader-story-grid">
          {visibleStories.map((story) => (
            <article className="reader-story-card" key={story.slug}>
              <Link
                to={`/articles/${story.slug}`}
                className="reader-story-image"
                aria-label={`Read ${story.title}`}
              >
                <StoryArtwork type={story.image} />
              </Link>

              <p className="reader-story-category">{story.category}</p>

              <h3>
                <Link to={`/articles/${story.slug}`}>{story.title}</Link>
              </h3>

              <p className="reader-story-excerpt">{story.excerpt}</p>

              <p className="reader-story-meta">
                {new Date(`${story.date}T12:00:00`).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
                {" · "}
                {story.readTime} min read
              </p>
            </article>
          ))}
        </div>

        {visibleStories.length === 0 && (
          <div className="reader-empty-state">
            <h3>No stories found</h3>
            <p>Try another search or choose a different category.</p>
            <button
              type="button"
              className="reader-filter"
              onClick={() => {
                setSelectedCategory("All");
                window.history.replaceState(null, "", "/");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
