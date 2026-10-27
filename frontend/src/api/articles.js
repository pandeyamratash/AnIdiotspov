
const API_BASE_URL = "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204) return null;
  return response.json();
}

export function getArticle(id) {
  return request(`/articles/${id}`);
}

export function getArticles({ includeDrafts = false } = {}) {
  return request(
    `/articles/${includeDrafts ? "?published_only=false" : ""}`
  );
}

export function createArticle(article) {
  return request("/articles/", {
    method: "POST",
    body: JSON.stringify(article),
  });
}

export function updateArticle(id, article) {
  return request(`/articles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(article),
  });
}

export function deleteArticle(id) {
  return request(`/articles/${id}`, {
    method: "DELETE",
  });
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    "http://127.0.0.1:8000/api/uploads/image",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Image upload failed.");
  }

  const data = await response.json();

  return {
    ...data,
    url: `http://127.0.0.1:8000${data.url}`,
  };
}
