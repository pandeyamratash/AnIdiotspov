import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ImagePlus,
  Bold,
  Italic,
  Underline,
  Heading1,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Save,
  Send,
  Download,
  Trash2,
  Undo2,
  Redo2,
  Strikethrough,
  Code,
  Minus,
  Grid2X2,
  LogOut,
} from "lucide-react";
import "../../styles/editor.css";

const STORAGE_DRAFTS = "idiotspov-drafts";
const STORAGE_ARTICLES = "idiotspov-articles";

export default function ArticleEditor() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Blogs");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [author, setAuthor] = useState("An Idiot");
  const [slug, setSlug] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [cover, setCover] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Draft");
  const [message, setMessage] = useState("");
  const [lastSaved, setLastSaved] = useState("");

  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  // Log out and return to the admin login page.
  function handleLogout() {
    sessionStorage.removeItem("idiotspov-admin-auth");
    navigate("/admin/login", { replace: true });
  }

  function makeSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function updateTitle(value) {
    setTitle(value);

    if (!slug || slug === makeSlug(title)) {
      setSlug(makeSlug(value));
    }
  }

  function uploadCover(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCover(String(reader.result));
      setMessage("");
    };

    reader.onerror = () => {
      setMessage("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function removeCover() {
    setCover("");
    setAltText("");
    setCaption("");
  }

  function getArticle(publish = false) {
    return {
      id: crypto.randomUUID(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      category,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      location: location.trim(),
      publicationDate,
      author: author.trim(),
      slug: slug.trim() || makeSlug(title),
      seoDescription: seoDescription.trim(),
      cover,
      altText: altText.trim(),
      caption: caption.trim(),
      content,
      status: publish ? "Published" : "Draft",
      updatedAt: new Date().toISOString(),
    };
  }

  function saveArticle(publish = false) {
    if (!title.trim()) {
      setMessage("Add a title before saving your article.");
      return;
    }

    const key = publish ? STORAGE_ARTICLES : STORAGE_DRAFTS;

    try {
      const article = getArticle(publish);
      const existing = JSON.parse(localStorage.getItem(key) || "[]");

      const existingIndex = existing.findIndex(
        (item) => item.slug && item.slug === article.slug
      );

      if (existingIndex >= 0) {
        existing[existingIndex] = {
          ...existing[existingIndex],
          ...article,
          id: existing[existingIndex].id,
        };
      } else {
        existing.push(article);
      }

      localStorage.setItem(key, JSON.stringify(existing));

      // Remove the matching draft after publishing.
      if (publish) {
        const drafts = JSON.parse(
          localStorage.getItem(STORAGE_DRAFTS) || "[]"
        );

        localStorage.setItem(
          STORAGE_DRAFTS,
          JSON.stringify(
            drafts.filter((item) => item.slug !== article.slug)
          )
        );
      }

      setStatus(publish ? "Published" : "Draft");

      setLastSaved(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      setMessage(
        publish
          ? "Article published in local storage."
          : "Draft saved successfully."
      );
    } catch {
      setMessage(
        "Unable to save. The article or images may be too large."
      );
    }
  }

  function exportJSON() {
    try {
      const article = getArticle(status === "Published");

      const blob = new Blob([JSON.stringify(article, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${article.slug || "article"}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
      setMessage("Article exported as JSON.");
    } catch {
      setMessage("Unable to export the article.");
    }
  }

  function previewArticle() {
    const article = getArticle(status === "Published");
    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      setMessage("Allow pop-ups to open the article preview.");
      return;
    }

    const escapeHtml = (value) =>
      String(value || "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]);

    previewWindow.document.write(`
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(article.title)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            max-width: 760px;
            margin: 60px auto;
            padding: 0 24px;
            color: #202d4b;
            font-family: Georgia, serif;
            line-height: 1.9;
          }
          h1 {
            font-size: clamp(38px, 7vw, 64px);
            line-height: 1.1;
          }
          .subtitle {
            color: #777;
            font-size: 22px;
          }
          .meta {
            color: #b94c2b;
            font: 12px Arial, sans-serif;
            letter-spacing: .1em;
            text-transform: uppercase;
          }
          img {
            display: block;
            width: 100%;
            height: auto;
            margin: 32px 0;
          }
          .body {
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            font-size: 19px;
          }
          figcaption {
            color: #777;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <p class="meta">${escapeHtml(article.category)}${
          article.location
            ? " · " + escapeHtml(article.location)
            : ""
        }</p>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="subtitle">${escapeHtml(article.subtitle)}</p>
        ${
          article.cover
            ? `<figure>
                <img src="${article.cover}" alt="${escapeHtml(article.altText)}" />
                <figcaption>${escapeHtml(article.caption)}</figcaption>
              </figure>`
            : ""
        }
        <p class="meta">By ${escapeHtml(article.author)}</p>
        <div class="body">${escapeHtml(article.content)}</div>
      </body>
      </html>
    `);

    previewWindow.document.close();
  }

  function insertAtCursor(text) {
    const textarea = document.getElementById("article-content");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const next =
      content.slice(0, start) + text + content.slice(end);

    setContent(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + text.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function formatText(before, after = before) {
    const textarea = document.getElementById("article-content");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const text = selected || "text";
    const replacement = `${before}${text}${after}`;

    setContent(
      content.slice(0, start) + replacement + content.slice(end)
    );

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + text.length
      );
    });
  }

  function insertInlineImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      insertAtCursor(
        `\n\n![${file.name}](${reader.result})\n\n`
      );
      setMessage("Image reference inserted at the cursor.");
    };

    reader.onerror = () => {
      setMessage("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <div className="editor-page reference-editor">
      <header className="reference-editor-navbar">
        <button
          className="reference-editor-brand"
          type="button"
          onClick={() => navigate("/")}
        >
          An idiots pov
        </button>

        <div className="reference-navbar-actions">
          <span className="reference-autosave-status">
            <span className="reference-draft-dot" />
            {status}
            {lastSaved && ` · saved ${lastSaved}`}
          </span>

          <button
            className="reference-button"
            type="button"
            onClick={previewArticle}
          >
            Preview
          </button>

          <button
            className="reference-button"
            type="button"
            onClick={exportJSON}
          >
            <Download size={15} />
            Export JSON
          </button>

          <button
            className="reference-button"
            type="button"
            onClick={() => saveArticle(false)}
          >
            <Save size={15} />
            Save draft
          </button>

          <button
            className="reference-button reference-publish"
            type="button"
            onClick={() => saveArticle(true)}
          >
            <Send size={15} />
            Publish
          </button>

          {/* Logout button */}
          <button
            className="reference-button reference-logout"
            type="button"
            onClick={handleLogout}
            title="Log out of your writing desk"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="reference-editor-layout">
        <main className="reference-writing-column">
          <section className="reference-cover-section">
            {cover ? (
              <div className="reference-cover-preview">
                <img
                  src={cover}
                  alt={altText || "Cover preview"}
                />

                <button
                  className="reference-remove-cover"
                  type="button"
                  onClick={removeCover}
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            ) : (
              <label className="reference-cover-upload">
                <ImagePlus size={20} />
                <span>Drop a cover image here, or click to upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadCover}
                  hidden
                />
              </label>
            )}

            <div className="reference-cover-details">
              <input
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
                placeholder="Alt text"
                aria-label="Cover image alt text"
              />

              <input
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Caption"
                aria-label="Cover image caption"
              />

              {cover && (
                <button type="button" onClick={removeCover}>
                  Remove
                </button>
              )}
            </div>
          </section>

          <input
            className="reference-title-input"
            value={title}
            onChange={(event) => updateTitle(event.target.value)}
            placeholder="Title"
            aria-label="Article title"
          />

          <input
            className="reference-subtitle-input"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            placeholder="Subtitle or short description"
            aria-label="Article subtitle"
          />

          <div className="reference-format-toolbar">
            <button
              type="button"
              title="Undo"
              onClick={() =>
                setMessage(
                  "Undo is not available for this text editor yet."
                )
              }
            >
              <Undo2 size={15} />
            </button>

            <button
              type="button"
              title="Redo"
              onClick={() =>
                setMessage(
                  "Redo is not available for this text editor yet."
                )
              }
            >
              <Redo2 size={15} />
            </button>

            <span className="reference-toolbar-separator" />

            <select
              aria-label="Paragraph style"
              defaultValue="Paragraph"
              onChange={(event) => {
                const value = event.target.value;

                if (value === "Heading 1") {
                  insertAtCursor("\n\n# Heading\n\n");
                }

                if (value === "Heading 2") {
                  insertAtCursor("\n\n## Heading\n\n");
                }

                if (value === "Quote") {
                  insertAtCursor("\n\n> Quote\n\n");
                }

                event.target.value = "Paragraph";
              }}
            >
              <option>Paragraph</option>
              <option>Heading 1</option>
              <option>Heading 2</option>
              <option>Quote</option>
            </select>

            <span className="reference-toolbar-separator" />

            <button
              type="button"
              title="Bold"
              onClick={() => formatText("**")}
            >
              <Bold size={16} />
            </button>

            <button
              type="button"
              title="Italic"
              onClick={() => formatText("*")}
            >
              <Italic size={16} />
            </button>

            <button
              type="button"
              title="Underline"
              onClick={() => formatText("<u>", "</u>")}
            >
              <Underline size={16} />
            </button>

            <button
              type="button"
              title="Strikethrough"
              onClick={() => formatText("~~")}
            >
              <Strikethrough size={16} />
            </button>

            <span className="reference-toolbar-separator" />

            <button
              type="button"
              title="Quote"
              onClick={() => insertAtCursor("\n\n> Quote\n\n")}
            >
              <Quote size={16} />
            </button>

            <button
              type="button"
              title="Heading"
              onClick={() => insertAtCursor("\n\n## Heading\n\n")}
            >
              <Heading1 size={17} />
            </button>

            <button
              type="button"
              title="Bulleted list"
              onClick={() => insertAtCursor("\n\n- List item\n")}
            >
              <List size={17} />
            </button>

            <button
              type="button"
              title="Numbered list"
              onClick={() => insertAtCursor("\n\n1. List item\n")}
            >
              <ListOrdered size={17} />
            </button>

            <button
              type="button"
              title="Insert link"
              onClick={() => formatText("[", "](https://example.com)")}
            >
              <LinkIcon size={16} />
            </button>

            <button
              type="button"
              title="Horizontal line"
              onClick={() => insertAtCursor("\n\n---\n\n")}
            >
              <Minus size={17} />
            </button>

            <button
              type="button"
              title="Code"
              onClick={() => formatText("`")}
            >
              <Code size={16} />
            </button>

            <label
              className="reference-toolbar-image"
              title="Insert image"
            >
              <ImagePlus size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={insertInlineImage}
                hidden
              />
              <span>Image</span>
            </label>

            <label
              className="reference-toolbar-image"
              title="Gallery images"
            >
              <Grid2X2 size={16} />
              <span>Gallery</span>
            </label>
          </div>

          <textarea
            id="article-content"
            className="reference-content-input"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Start writing your story..."
            aria-label="Article content"
          />

          <div className="reference-word-count">
            {wordCount} words
          </div>

          {message && (
            <p className="reference-editor-message" role="status">
              {message}
            </p>
          )}
        </main>

        <aside className="reference-metadata-panel">
          <label className="reference-field">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {["Blogs", "Stories", "Travelogues", "Life", "Poetry"].map(
                (item) => (
                  <option key={item}>{item}</option>
                )
              )}
            </select>
          </label>

          <label className="reference-field">
            <span>Tags (comma separated)</span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="mountains, slow travel"
            />
          </label>

          <label className="reference-field">
            <span>Location (travelogues)</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Hampi, India"
            />
          </label>

          <label className="reference-field">
            <span>Publication date</span>
            <input
              type="text"
              value={publicationDate}
              onChange={(event) =>
                setPublicationDate(event.target.value)
              }
              placeholder="dd-mm-yyyy"
              onFocus={(event) => {
                event.target.type = "date";
              }}
              onBlur={(event) => {
                if (!event.target.value) {
                  event.target.type = "text";
                }
              }}
            />
          </label>

          <label className="reference-field">
            <span>Author</span>
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="An Idiot"
            />
          </label>

          <label className="reference-field">
            <span>URL slug</span>
            <input
              value={slug}
              onChange={(event) => setSlug(makeSlug(event.target.value))}
              placeholder="auto-generated"
            />
          </label>

          <label className="reference-field">
            <span>SEO description</span>
            <textarea
              value={seoDescription}
              onChange={(event) =>
                setSeoDescription(event.target.value)
              }
              rows={2}
              maxLength={160}
            />
          </label>

          <div className="reference-metadata-footer">
            <span>{wordCount} words</span>
            <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
          </div>
        </aside>
      </div>
    </div>
  );
}