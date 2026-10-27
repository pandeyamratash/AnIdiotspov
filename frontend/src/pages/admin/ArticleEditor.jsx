
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Save, ImagePlus } from "lucide-react";
import "../../styles/editor.css";
import {
  getArticle,
  createArticle,
  updateArticle as updateArticleAPI,
  uploadImage,
} from "../../api/articles";

const API_ORIGIN = "http://127.0.0.1:8000";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const today = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const emptyArticle = () => ({
  id: `article-${Date.now()}`,
  title: "",
  subtitle: "",
  content: "",
  category: "Blogs",
  tags: "",
  status: "private",
  published: false,
  date: today(),
  coverImage: "",
  slug: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function getImageUrl(path) {
  if (!path) return "";

  if (/^(https?:\/\/|data:|blob:)/i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(/^\/+/, "")}`;
}

function validateImage(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Choose a JPG, PNG, WEBP, or GIF image.");
  }

  if (file.size === 0) {
    throw new Error("The selected image is empty.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Images must be 5 MB or smaller.");
  }
}

export default function ArticleEditor() {
  const navigate = useNavigate();

  const editorRef = useRef(null);
  const coverInputRef = useRef(null);
  const inlineInputRef = useRef(null);
  const savedRangeRef = useRef(null);

  const [article, setArticle] = useState(emptyArticle);
  const [message, setMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [inlineUploading, setInlineUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load an existing article from FastAPI.
  useEffect(() => {
    let cancelled = false;

    async function loadArticle() {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get("id");

      if (!editId) return;

      try {
        const existing = await getArticle(editId);

        if (cancelled) return;

        setArticle({
          ...emptyArticle(),
          ...existing,
          id: existing.id,
          status: existing.published ? "public" : "private",
          published: existing.published,
          subtitle: existing.subtitle || "",
          content: existing.content || "",
          date: existing.created_at
            ? existing.created_at.slice(0, 10)
            : today(),
          tags: existing.tags || "",
          coverImage: existing.cover_image || "",
        });
      } catch (error) {
        if (!cancelled) {
          setMessage(`Could not load article: ${error.message}`);
        }
      }
    }

    loadArticle();

    return () => {
      cancelled = true;
    };
  }, []);

  // Populate the editor after the article has loaded.
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = article.content || "";
    }
  }, [article.id]);

  function updateArticle(field, value) {
    setArticle((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function syncEditorContent() {
    const content = editorRef.current?.innerHTML || "";
    updateArticle("content", content);
    return content;
  }

  // Preserve the user's cursor before opening the file picker.
  function rememberCursor() {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (
      !editor ||
      !selection ||
      selection.rangeCount === 0 ||
      !editor.contains(selection.anchorNode)
    ) {
      return;
    }

    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }

  function restoreCursor() {
    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();
    const savedRange = savedRangeRef.current;

    if (
      selection &&
      savedRange &&
      editor.contains(savedRange.startContainer) &&
      editor.contains(savedRange.endContainer)
    ) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
      return;
    }

    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);

      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  // Insert a successfully uploaded image at the saved cursor position.
  function insertImageElement(url, altText = "") {
    const editor = editorRef.current;

    if (!editor) {
      setMessage("The writing editor is not available.");
      return;
    }

    restoreCursor();

    const selection = window.getSelection();
    const image = document.createElement("img");

    image.src = url;
    image.alt = altText;
    image.loading = "lazy";
    image.style.maxWidth = "100%";
    image.style.height = "auto";
    image.style.display = "block";
    image.style.margin = "1.5rem auto";

    if (
      selection &&
      selection.rangeCount > 0 &&
      editor.contains(selection.anchorNode)
    ) {
      const range = selection.getRangeAt(0);

      range.deleteContents();
      range.insertNode(image);

      const spacer = document.createElement("p");
      spacer.appendChild(document.createElement("br"));
      image.after(spacer);

      const nextRange = document.createRange();
      nextRange.setStart(spacer, 0);
      nextRange.collapse(true);

      selection.removeAllRanges();
      selection.addRange(nextRange);

      savedRangeRef.current = nextRange.cloneRange();
    } else {
      editor.appendChild(image);
      editor.appendChild(document.createElement("p"));
    }

    syncEditorContent();
    editor.focus();
  }

  // Upload an inline image to FastAPI instead of embedding Base64.
  async function insertImageInArticle(event) {
    const file = event.target.files?.[0];

    // Allow the same image to be selected again later.
    event.target.value = "";

    if (!file) return;

    try {
      validateImage(file);
      rememberCursor();

      setInlineUploading(true);
      setMessage("Uploading inline image...");

      const uploaded = await uploadImage(file);

      if (!uploaded?.url) {
        throw new Error("The server did not return an image URL.");
      }

      insertImageElement(uploaded.url, file.name);

      setMessage("Inline image uploaded and inserted.");
    } catch (error) {
      setMessage(`Inline image upload failed: ${error.message}`);
    } finally {
      setInlineUploading(false);
    }
  }

  // Upload the cover and store its returned URL in React state.
  async function uploadCover(file) {
    if (!file) return;

    try {
      validateImage(file);

      setCoverUploading(true);
      setMessage("Uploading cover image...");

      const uploaded = await uploadImage(file);

      if (!uploaded?.url) {
        throw new Error("The server did not return an image URL.");
      }

      updateArticle("coverImage", uploaded.url);
      setMessage("Cover image uploaded successfully.");
    } catch (error) {
      setMessage(`Cover upload failed: ${error.message}`);
    } finally {
      setCoverUploading(false);
    }
  }

  function handleCoverUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    void uploadCover(file);
  }

  function handleCoverDrop(event) {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void uploadCover(file);
    }
  }

  async function saveArticle(nextStatus = article.status) {
    const title = article.title.trim();

    if (!title) {
      setMessage("Please enter an article title.");
      return;
    }

    if (coverUploading || inlineUploading) {
      setMessage("Please wait for image uploads to finish.");
      return;
    }

    const content = editorRef.current?.innerHTML ?? article.content ?? "";
    const published = nextStatus === "public";

    const payload = {
      title,
      subtitle: article.subtitle || null,
      content,
      category: article.category || null,
      tags: article.tags || null,
      status: published ? "published" : "draft",
      published,
      cover_image: article.coverImage || null,
    };

    try {
      setSaving(true);
      setMessage("Saving article...");

      const isExistingArticle =
        typeof article.id === "number" ||
        (typeof article.id === "string" && /^\d+$/.test(article.id));

      const saved = isExistingArticle
        ? await updateArticleAPI(Number(article.id), payload)
        : await createArticle(payload);

      const updatedArticle = {
        ...article,
        ...saved,
        id: saved.id,
        status: saved.published ? "public" : "private",
        published: saved.published,
        subtitle: saved.subtitle || "",
        content: saved.content || "",
        coverImage: saved.cover_image || "",
        tags: saved.tags || "",
        date: saved.created_at
          ? saved.created_at.slice(0, 10)
          : article.date,
        createdAt: saved.created_at,
        updatedAt: saved.updated_at,
      };

      setArticle(updatedArticle);

      setMessage(
        saved.published
          ? "Article published successfully."
          : "Draft saved to database."
      );

      // Use the database ID for all future edits.
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?id=${saved.id}`
      );

      return saved;
    } catch (error) {
      setMessage(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    await saveArticle(article.status);
  }

  function handlePublishChange(status) {
    setArticle((current) => ({
      ...current,
      status,
      published: status === "public",
    }));
  }

  function handlePreview() {
    syncEditorContent();
    setPreviewOpen(true);
  }

  function insertFormatting(command, value = null) {
    editorRef.current?.focus();

    document.execCommand(command, false, value);

    syncEditorContent();
    rememberCursor();
  }

  function insertLink() {
    const url = window.prompt("Enter the link URL:");

    if (!url) return;

    try {
      const parsed = new URL(url);

      if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
        throw new Error("Unsupported link type.");
      }

      insertFormatting("createLink", url);
    } catch {
      setMessage("Please enter a valid http, https, or email link.");
    }
  }

  function startNewArticle() {
    if (
      article.title.trim() ||
      (editorRef.current?.innerHTML || "").trim()
    ) {
      const shouldLeave = window.confirm(
        "Start a new article? Save your current changes first if you want to keep them."
      );

      if (!shouldLeave) return;
    }

    setArticle(emptyArticle());

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }

    savedRangeRef.current = null;

    window.history.replaceState({}, "", window.location.pathname);
    setMessage("");
  }

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <div className="editor-breadcrumbs">
          <button
            className="editor-back-link"
            type="button"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>

          <span className="editor-entry-label">
            {new URLSearchParams(window.location.search).has("id")
              ? "EDIT ENTRY"
              : "NEW ENTRY"}
          </span>
        </div>

        <div className="editor-actions">
          <span
            className={`editor-status-pill ${
              article.status === "public" ? "is-public" : ""
            }`}
          >
            {article.status === "public" ? "PUBLIC" : "PRIVATE"}
          </span>

          <button
            className="editor-preview-button"
            type="button"
            onClick={handlePreview}
          >
            <Eye size={15} />
            Preview
          </button>

          <button
            className="editor-save-button"
            type="button"
            onClick={handleSave}
            disabled={saving || coverUploading || inlineUploading}
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {message && (
        <div className="editor-message" role="status">
          {message}
        </div>
      )}

      <div className="editor-columns">
        <main className="editor-writing-column">
          <input
            ref={coverInputRef}
            className="editor-hidden-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleCoverUpload}
          />

          <button
            className={`editor-cover-upload ${
              article.coverImage ? "has-cover" : ""
            }`}
            type="button"
            disabled={coverUploading}
            onClick={() => coverInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleCoverDrop}
          >
            {article.coverImage ? (
              <>
                <img
                  className="editor-cover-image"
                  src={getImageUrl(article.coverImage)}
                  alt="Article cover"
                />

                <span className="editor-cover-change">
                  <ImagePlus size={16} />
                  {coverUploading ? "Uploading..." : "Change cover image"}
                </span>
              </>
            ) : (
              <span className="editor-cover-placeholder">
                {coverUploading
                  ? "Uploading cover image..."
                  : "Drop a cover image here, or click to upload"}
              </span>
            )}
          </button>

          <input
            className="editor-title-input"
            type="text"
            placeholder="Title"
            aria-label="Article title"
            value={article.title}
            onChange={(event) => updateArticle("title", event.target.value)}
          />

          <input
            className="editor-subtitle-input"
            type="text"
            placeholder="Subtitle or short description"
            aria-label="Article subtitle"
            value={article.subtitle}
            onChange={(event) =>
              updateArticle("subtitle", event.target.value)
            }
          />

          <div
            className="editor-toolbar"
            role="toolbar"
            aria-label="Text formatting"
          >
            <select
              aria-label="Text style"
              className="editor-format-select"
              defaultValue="p"
              onChange={(event) =>
                insertFormatting("formatBlock", event.target.value)
              }
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="blockquote">Quote</option>
            </select>

            <span className="editor-toolbar-divider" />

            <button type="button" title="Undo" onClick={() => insertFormatting("undo")}>↶</button>
            <button type="button" title="Redo" onClick={() => insertFormatting("redo")}>↷</button>

            <span className="editor-toolbar-divider" />

            <button type="button" title="Bold" onClick={() => insertFormatting("bold")}><strong>B</strong></button>
            <button type="button" title="Italic" onClick={() => insertFormatting("italic")}><em>I</em></button>
            <button type="button" title="Underline" onClick={() => insertFormatting("underline")}><u>U</u></button>
            <button type="button" title="Strikethrough" onClick={() => insertFormatting("strikeThrough")}><s>S</s></button>

            <span className="editor-toolbar-divider" />

            <button type="button" title="Block quote" onClick={() => insertFormatting("formatBlock", "blockquote")}>❝</button>
            <button type="button" title="Bulleted list" onClick={() => insertFormatting("insertUnorderedList")}>• List</button>
            <button type="button" title="Numbered list" onClick={() => insertFormatting("insertOrderedList")}>1. List</button>
            <button type="button" title="Insert link" onClick={insertLink}>Link</button>
            <button type="button" title="Horizontal line" onClick={() => insertFormatting("insertHorizontalRule")}>—</button>

            <span className="editor-toolbar-divider" />

            <button
              type="button"
              title="Insert image"
              disabled={inlineUploading}
              onMouseDown={rememberCursor}
              onClick={() => inlineInputRef.current?.click()}
            >
              ▣ {inlineUploading ? "Uploading..." : "Image"}
            </button>

            <input
              ref={inlineInputRef}
              className="editor-hidden-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={insertImageInArticle}
            />
          </div>

          <div
            ref={editorRef}
            className="editor-rich-text"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-label="Article content"
            aria-multiline="true"
            data-placeholder="Start writing your story..."
            onInput={() => {
              syncEditorContent();
              rememberCursor();
            }}
            onKeyUp={rememberCursor}
            onMouseUp={rememberCursor}
            onBlur={rememberCursor}
          />
        </main>

        <aside className="editor-settings-column">
          <section className="editor-visibility-card">
            <label className="editor-section-label">VISIBILITY</label>

            <div className="editor-visibility-toggle">
              <button
                type="button"
                className={article.status !== "public" ? "selected private" : ""}
                onClick={() => handlePublishChange("private")}
              >
                Private
              </button>

              <button
                type="button"
                className={article.status === "public" ? "selected public" : ""}
                onClick={() => handlePublishChange("public")}
              >
                Public
              </button>
            </div>

            <p className="editor-visibility-description">
              {article.status === "public"
                ? "This article is marked public and can appear on the public site."
                : "Only you can see this in the editor. It will not appear on the public site."}
            </p>
          </section>

          <div className="editor-field">
            <label className="editor-section-label" htmlFor="editor-category">
              CATEGORY
            </label>

            <select
              id="editor-category"
              value={article.category}
              onChange={(event) => updateArticle("category", event.target.value)}
            >
              <option value="Blogs">Blogs</option>
              <option value="Travelogues">Travelogues</option>
              <option value="Life Experiences">Life Experiences</option>
              <option value="Poetry">Poetry</option>
              <option value="Stories">Stories</option>
              <option value="Reflections">Reflections</option>
            </select>
          </div>

          <div className="editor-field">
            <label className="editor-section-label" htmlFor="editor-tags">
              TAGS (COMMA SEPARATED)
            </label>

            <input
              id="editor-tags"
              type="text"
              placeholder="mountains, slow travel"
              value={article.tags}
              onChange={(event) => updateArticle("tags", event.target.value)}
            />
          </div>

          <div className="editor-field">
            <label className="editor-section-label" htmlFor="editor-date">
              DATE
            </label>

            <input
              id="editor-date"
              type="date"
              value={article.date}
              onChange={(event) => updateArticle("date", event.target.value)}
            />
          </div>
        </aside>
      </div>

      {previewOpen && (
        <div
          className="editor-preview-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewOpen(false);
            }
          }}
        >
          <article
            className="editor-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Article preview"
          >
            <div className="editor-preview-modal-top">
              <span>ARTICLE PREVIEW</span>
              <button type="button" onClick={() => setPreviewOpen(false)}>
                Close
              </button>
            </div>

            {article.coverImage && (
              <img
                className="editor-preview-cover"
                src={getImageUrl(article.coverImage)}
                alt=""
              />
            )}

            <div className="editor-preview-body">
              <p className="editor-preview-category">{article.category}</p>
              <h1>{article.title || "Untitled article"}</h1>

              {article.subtitle && (
                <p className="editor-preview-subtitle">{article.subtitle}</p>
              )}

              <p className="editor-preview-date">{article.date}</p>

              <div
                className="editor-preview-content"
                dangerouslySetInnerHTML={{
                  __html:
                    editorRef.current?.innerHTML || article.content || "",
                }}
              />
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
