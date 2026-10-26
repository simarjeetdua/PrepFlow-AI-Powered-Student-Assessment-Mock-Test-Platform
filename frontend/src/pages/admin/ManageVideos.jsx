
import { useEffect, useMemo, useState } from "react";
import {
  Video,
  Plus,
  Search,
  RefreshCw,
  Play,
  Eye,
  EyeOff,
  Trash2,
  X,
  LoaderCircle,
  ExternalLink,
  Clock,
} from "lucide-react";

import api from "../../services/api";
import "./ManageVideos.css";

const emptyForm = {
  title: "",
  description: "",
  subject: "",
  videoUrl: "",
  duration: "",
};

const getYouTubeEmbedUrl = (url) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id
          ? `https://www.youtube-nocookie.com/embed/${id}`
          : null;
      }

      const match = parsed.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
      return match
        ? `https://www.youtube-nocookie.com/embed/${match[2]}`
        : null;
    }

    return null;
  } catch {
    return null;
  }
};

const ManageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadVideos = async () => {
    setLoading(true);
    setError("");

    try {
      // Requires the video-management API to be implemented.
      const response = await api.get("/videos/admin");
      setVideos(response.data.videos || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load videos. Check the video API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (video) => {
    setEditingId(video._id);
    setForm({
      title: video.title || "",
      description: video.description || "",
      subject: video.subject || "",
      videoUrl: video.videoUrl || "",
      duration: video.duration ?? "",
    });
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    let parsedUrl;

    try {
      parsedUrl = new URL(form.videoUrl);
    } catch {
      setError("Enter a valid video URL beginning with https://.");
      return;
    }

    if (
      parsedUrl.protocol !== "https:" ||
      !["youtube.com", "www.youtube.com", "m.youtube.com",
        "youtu.be", "www.youtu.be",
        "youtube-nocookie.com", "www.youtube-nocookie.com"
      ].includes(parsedUrl.hostname) &&
      !["vimeo.com", "www.vimeo.com"].includes(parsedUrl.hostname)
    ) {
      setError("Use a secure YouTube or Vimeo video URL.");
      return;
    }

    if (!form.title.trim() || !form.subject.trim()) {
      setError("Title and subject are required.");
      return;
    }

    const duration = form.duration === ""
      ? undefined
      : Number(form.duration);

    if (
      duration !== undefined &&
      (!Number.isFinite(duration) || duration < 0)
    ) {
      setError("Duration must be zero or a positive number of minutes.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      subject: form.subject.trim(),
      videoUrl: form.videoUrl.trim(),
      ...(duration !== undefined ? { duration } : {}),
    };

    setSaving(true);

    try {
      const response = editingId
        ? await api.put(`/videos/${editingId}`, payload)
        : await api.post("/videos", payload);

      setMessage(
        response.data.message ||
          (editingId
            ? "Video lesson updated successfully."
            : "Video lesson added successfully.")
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadVideos();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the video lesson."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (video) => {
    setActionId(video._id);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/videos/${video._id}/publish`
      );

      setVideos((previous) =>
        previous.map((item) =>
          item._id === video._id
            ? {
                ...item,
                isPublished: response.data.video.isPublished,
              }
            : item
        )
      );

      setMessage(
        response.data.message || "Video publication status updated."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update video publication status."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (video) => {
    const confirmed = window.confirm(
      `Delete the video lesson "${video.title}"?`
    );

    if (!confirmed) return;

    setActionId(video._id);
    setError("");
    setMessage("");

    try {
      const response = await api.delete(`/videos/${video._id}`);

      setVideos((previous) =>
        previous.filter((item) => item._id !== video._id)
      );

      setMessage(
        response.data.message || "Video lesson deleted successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the video lesson."
      );
    } finally {
      setActionId(null);
    }
  };

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return videos.filter(
      (video) =>
        video.title?.toLowerCase().includes(query) ||
        video.subject?.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query)
    );
  }, [videos, search]);

  const publishedCount = videos.filter(
    (video) => video.isPublished
  ).length;

  return (
    <div className="manage-videos-page">
      <header className="manage-videos-header">
        <div>
          <span className="manage-videos-eyebrow">
            CONTENT MANAGEMENT
          </span>
          <h1>Video Lessons</h1>
          <p>
            Organize recorded lessons and control student access.
          </p>
        </div>

        <button
          type="button"
          className="manage-videos-primary-button"
          onClick={openCreateForm}
          disabled={loading || saving || actionId !== null}
        >
          <Plus size={18} />
          Add Video
        </button>
      </header>

      {error && (
        <div className="manage-videos-alert error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {message && (
        <div className="manage-videos-alert success" role="status">
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="manage-videos-stats">
        <article className="manage-videos-stat-card">
          <span className="manage-videos-stat-icon">
            <Video size={22} />
          </span>
          <div>
            <p>Total Videos</p>
            <strong>{loading ? "—" : videos.length}</strong>
          </div>
        </article>

        <article className="manage-videos-stat-card">
          <span className="manage-videos-stat-icon published">
            <Eye size={22} />
          </span>
          <div>
            <p>Published</p>
            <strong>{loading ? "—" : publishedCount}</strong>
          </div>
        </article>

        <article className="manage-videos-stat-card">
          <span className="manage-videos-stat-icon drafts">
            <EyeOff size={22} />
          </span>
          <div>
            <p>Drafts</p>
            <strong>
              {loading ? "—" : videos.length - publishedCount}
            </strong>
          </div>
        </article>
      </section>

      {showForm && (
        <section className="manage-videos-panel">
          <div className="manage-videos-panel-heading">
            <div>
              <h2>{editingId ? "Edit Video" : "Add Video Lesson"}</h2>
              <p>
                Add a secure YouTube or Vimeo link to your lesson.
              </p>
            </div>

            <button
              type="button"
              className="manage-videos-icon-button"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close form"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="manage-videos-form-grid">
              <label>
                Video Title *
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Introduction to DBMS"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Subject *
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="e.g. DBMS"
                  maxLength={100}
                  required
                />
              </label>

              <label className="full-width">
                Video URL *
                <input
                  type="url"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </label>

              <label>
                Duration (minutes)
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="e.g. 25"
                />
              </label>

              <label className="full-width">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={1000}
                  placeholder="What will students learn?"
                />
              </label>
            </div>

            <div className="manage-videos-form-actions">
              <button
                type="button"
                className="manage-videos-secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="manage-videos-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle
                    size={18}
                    className="manage-videos-spin"
                  />
                ) : (
                  <Plus size={18} />
                )}
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add as Draft"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="manage-videos-panel">
        <div className="manage-videos-list-heading">
          <div>
            <h2>All Video Lessons</h2>
            <p>Preview, edit, publish, or delete video lessons.</p>
          </div>

          <label className="manage-videos-search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search videos..."
              aria-label="Search video lessons"
            />
          </label>
        </div>

        {loading ? (
          <div className="manage-videos-empty">
            <LoaderCircle
              size={28}
              className="manage-videos-spin"
            />
            <p>Loading videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="manage-videos-empty">
            <Video size={35} />
            <strong>
              {search ? "No matching videos" : "No video lessons yet"}
            </strong>
            <p>
              {search
                ? "Try a different title or subject."
                : "Add your first video lesson to get started."}
            </p>
          </div>
        ) : (
          <div className="manage-videos-grid">
            {filteredVideos.map((video) => {
              const embedUrl = getYouTubeEmbedUrl(video.videoUrl);

              return (
                <article
                  className="manage-videos-card"
                  key={video._id}
                >
                  <div className="manage-videos-preview">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={video.title}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <a
                        className="manage-videos-external-preview"
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Play size={30} />
                        Open video
                        <ExternalLink size={15} />
                      </a>
                    )}

                    <span
                      className={`manage-videos-status ${
                        video.isPublished ? "published" : "draft"
                      }`}
                    >
                      {video.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="manage-videos-card-content">
                    <span className="manage-videos-subject">
                      {video.subject}
                    </span>

                    <h3>{video.title}</h3>

                    <p>
                      {video.description || "No description provided."}
                    </p>

                    <div className="manage-videos-meta">
                      <span>
                        <Clock size={15} />
                        {video.duration
                          ? `${video.duration} min`
                          : "Duration not set"}
                      </span>

                      <span>
                        {video.createdAt
                          ? new Date(
                              video.createdAt
                            ).toLocaleDateString()
                          : ""}
                      </span>
                    </div>

                    <div className="manage-videos-card-actions">
                      <button
                        type="button"
                        className="manage-videos-secondary-button"
                        onClick={() => openEditForm(video)}
                        disabled={actionId !== null || saving}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="manage-videos-icon-button"
                        onClick={() => handleTogglePublish(video)}
                        disabled={actionId !== null || saving}
                        title={
                          video.isPublished ? "Unpublish" : "Publish"
                        }
                        aria-label={`${
                          video.isPublished ? "Unpublish" : "Publish"
                        } ${video.title}`}
                      >
                        {actionId === video._id ? (
                          <LoaderCircle
                            size={17}
                            className="manage-videos-spin"
                          />
                        ) : video.isPublished ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>

                      <button
                        type="button"
                        className="manage-videos-icon-button delete"
                        onClick={() => handleDelete(video)}
                        disabled={actionId !== null || saving}
                        title="Delete video"
                        aria-label={`Delete ${video.title}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ManageVideos;
