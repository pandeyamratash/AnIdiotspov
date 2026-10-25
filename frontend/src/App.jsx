
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/public/Home";
import ArticlePage from "./pages/public/ArticlePage";

import AdminLogin from "./pages/admin/AdminLogin";
import ArticleEditor from "./pages/admin/ArticleEditor";

// Admin Articles Page
function AdminArticles() {
  return (
    <section>
      <p className="admin-eyebrow">YOUR WRITING SPACE</p>
      <h1>Articles</h1>
      <p>Manage your published stories and unfinished drafts.</p>
    </section>
  );
}

// Admin Categories Page
function AdminCategories() {
  return (
    <section>
      <p className="admin-eyebrow">ORGANIZE YOUR WRITING</p>
      <h1>Categories</h1>
      <p>
        Organize stories, travelogues, poetry, and life experiences.
      </p>
    </section>
  );
}

// Admin Notebooks Page
function AdminNotebooks() {
  return (
    <section>
      <p className="admin-eyebrow">YOUR PRIVATE COLLECTIONS</p>
      <h1>Notebooks</h1>
      <p>Keep related ideas and writing together.</p>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/articles/:slug"
            element={<ArticlePage />}
          />
        </Route>

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Admin Workspace */}
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          {/* Default page when opening /admin */}
          <Route
            index
            element={<Navigate to="editor" replace />}
          />

          <Route
            path="editor"
            element={<ArticleEditor />}
          />

          <Route
            path="articles"
            element={<AdminArticles />}
          />

          <Route
            path="categories"
            element={<AdminCategories />}
          />

          <Route
            path="notebooks"
            element={<AdminNotebooks />}
          />
        </Route>

        {/* Redirect unknown URLs */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
