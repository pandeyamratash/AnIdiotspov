
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../styles/article.css";

const articles = {
  "the-last-bus-to-hampi": {
    category: "Travelogues",
    title: "The Last Bus to Hampi",
    date: "September 14, 2026",
    readTime: "6 min read",
    excerpt:
      "Some journeys begin with a destination. Others begin with a bus you almost missed.",
    paragraphs: [
      "The bus was already coughing smoke when I reached the stand. A few people stood beneath the fading signboard, carrying bags, steel bottles, and the quiet impatience of people who had somewhere to be.",
      "I found a window seat near the back. Outside, the evening was slowly losing its colour, and the road stretched ahead like a sentence whose ending I hadn't decided.",
      "By the time we reached Hampi, the sky had turned the colour of burnt orange. The stones looked older than time, and for once, I didn't feel the need to photograph everything. I just stood there and looked.",
    ],
  },

  "on-being-slightly-wrong": {
    category: "Life",
    title: "On Being Slightly Wrong, Mostly Forever",
    date: "August 29, 2026",
    readTime: "4 min read",
    excerpt: "Growing up is learning to make peace with unfinished answers.",
    paragraphs: [
      "I used to think adulthood would arrive with a clean set of instructions. Instead, it arrived quietly, disguised as ordinary days and decisions I wasn't entirely sure about.",
      "Perhaps being wrong isn't always a failure. Sometimes it is simply evidence that we tried to understand something beyond what we already knew.",
    ],
  },

  "a-room-with-no-clock": {
    category: "Life",
    title: "A Room With No Clock",
    date: "August 2, 2026",
    readTime: "5 min read",
    excerpt: "A small reflection on silence, time, and being alone.",
    paragraphs: [
      "The room had one window, a wooden chair, and no clock. For the first time in months, I had no reason to measure the afternoon.",
      "The silence was uncomfortable at first. Then, slowly, it became a place I could rest.",
    ],
  },

  "monsoon-letter": {
    category: "Poetry",
    title: "Monsoon Letter",
    date: "July 20, 2026",
    readTime: "1 min read",
    excerpt: "A letter to the rain, and everything it remembers.",
    paragraphs: [
      "Dear rain, you returned without asking whether I was ready.",
      "You found the dust on my windows, the words I never sent, and the streets that still remembered our footsteps.",
    ],
  },

  "things-i-learned-from-a-bad-map": {
    category: "Stories",
    title: "Things I Learned From a Bad Map",
    date: "July 4, 2026",
    readTime: "3 min read",
    excerpt:
      "Sometimes getting lost is the only way to notice where you are.",
    paragraphs: [
      "The map promised a shortcut. The road offered a field, two confused dogs, and a shop that had been closed for years.",
      "I eventually found the right road. But I remembered the wrong turns more clearly than the destination.",
    ],
  },
};

export default function ArticlePage() {
  const { slug } = useParams();
  const article = articles[slug];

  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

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
  }, [slug]);

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
      setCopied(false);
      window.prompt("Copy this story link:", window.location.href);
    }
  }

  if (!article) {
    return (
      <section className="article-not-found">
        <h1>Story not found.</h1>
        <p>The story may have moved or does not exist.</p>
        <Link to="/">Return to home</Link>
      </section>
    );
  }

  return (
    <>
      <div className="article-progress-track" aria-hidden="true">
        <div
          className="article-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article className="article-page">
        <Link className="article-back" to="/stories">
          ← Back to stories
        </Link>

        <header className="article-header">
          <span className="article-category">{article.category}</span>

          <h1>{article.title}</h1>

          <p className="article-excerpt">{article.excerpt}</p>

          <div className="article-meta">
            <span>{article.date}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readTime}</span>
          </div>
        </header>

        <div
          className="article-cover"
          role="img"
          aria-label={`Cover artwork for ${article.title}`}
        >
          <span>{article.category}</span>
        </div>

        <div className="article-body">
          {article.paragraphs.map((paragraph, index) => (
            <p key={`${slug}-${index}`}>{paragraph}</p>
          ))}

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

          <Link className="article-back-bottom" to="/stories">
            Explore more stories →
          </Link>
        </div>
      </article>
    </>
  );
}
