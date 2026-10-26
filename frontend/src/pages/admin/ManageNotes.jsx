
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Upload,
  FileText,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  X,
  LoaderCircle,
  FileUp,
  Download,
} from "lucide-react";

import api from "../../services/api";
import "./ManageNotes.css";

const emptyForm = {
  title: "",
  description: "",
  subject: "",
};

const ManageNotes = () => {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const loadNotes = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/notes/admin");
      setNotes(response.data.notes || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load study notes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setFile(null);
    setError("");

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" ||
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("The PDF must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim() || !form.subject.trim() || !file) {
      setError("Title, subject, and a PDF file are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("subject", form.subject.trim());
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await api.post("/notes", formData);

      setMessage(
        response.data.message || "PDF uploaded successfully."
      );

      setForm(emptyForm);
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadNotes();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to upload PDF."
      );
    } finally {
      setUploading(false);
    }
  };

  const handlePublishToggle = async (note) => {
    setActionId(note._id);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/notes/${note._id}/publish`
      );

      setNotes((previous) =>
        previous.map((item) =>
          item._id === note._id
            ? {
                ...item,
                isPublished: response.data.note.isPublished,
              }
            : item
        )
      );

      setMessage(
        response.data.message || "Note status updated."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update publication status."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (note) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${note.title}" and its PDF?`
    );

    if (!confirmed) return;

    setActionId(note._id);
    setError("");
    setMessage("");

    try {
      const response = await api.delete(`/notes/${note._id}`);

      setNotes((previous) =>
        previous.filter((item) => item._id !== note._id)
      );

      setMessage(
        response.data.message || "Note deleted successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete note."
      );
    } finally {
      setActionId(null);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const query = search.trim().toLowerCase();

    return (
      note.title?.toLowerCase().includes(query) ||
      note.subject?.toLowerCase().includes(query) ||
      note.description?.toLowerCase().includes(query)
    );
  });

  const publishedCount = notes.filter(
    (note) => note.isPublished
  ).length;

  return (
    <div className="manage-notes-page">
      <header className="manage-notes-header">
        <div>
          <span className="manage-notes-eyebrow">
            CONTENT MANAGEMENT
          </span>
          <h1>Study Notes</h1>
          <p>
            Upload PDF resources and manage what students can access.
          </p>
        </div>

        <button
          type="button"
          className="manage-notes-refresh"
          onClick={loadNotes}
          disabled={loading || uploading || actionId !== null}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="manage-notes-alert error" role="alert">
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
        <div className="manage-notes-alert success" role="status">
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

      <section className="manage-notes-stats">
        <article className="manage-notes-stat-card">
          <span className="manage-notes-stat-icon">
            <BookOpen size={22} />
          </span>
          <div>
            <p>Total Notes</p>
            <strong>{loading ? "—" : notes.length}</strong>
          </div>
        </article>

        <article className="manage-notes-stat-card">
          <span className="manage-notes-stat-icon published">
            <Eye size={22} />
          </span>
          <div>
            <p>Published</p>
            <strong>{loading ? "—" : publishedCount}</strong>
          </div>
        </article>

        <article className="manage-notes-stat-card">
          <span className="manage-notes-stat-icon drafts">
            <FileText size={22} />
          </span>
          <div>
            <p>Drafts</p>
            <strong>
              {loading ? "—" : notes.length - publishedCount}
            </strong>
          </div>
        </article>
      </section>

      <section className="manage-notes-panel">
        <div className="manage-notes-panel-header">
          <div>
            <h2>Upload New Material</h2>
            <p>PDF only, maximum file size 10 MB.</p>
          </div>
          <FileUp size={23} />
        </div>

        <form onSubmit={handleUpload}>
          <div className="manage-notes-form-grid">
            <label>
              Note Title *
              <input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g. DBMS Complete Notes"
                maxLength={150}
                required
              />
            </label>

            <label>
              Subject *
              <input
                name="subject"
                value={form.subject}
                onChange={handleFormChange}
                placeholder="e.g. Database Management Systems"
                maxLength={100}
                required
              />
            </label>

            <label className="full-width">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Describe the learning material..."
                rows={3}
                maxLength={1000}
              />
            </label>

            <div className="full-width">
              <label className="manage-notes-field-label">
                PDF File *
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="manage-notes-file-input"
              />

              <div className="manage-notes-file-summary">
                <FileText size={23} />
                <div>
                  <strong>
                    {file ? file.name : "No PDF selected"}
                  </strong>
                  <p>
                    {file
                      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                      : "Choose a PDF from your device."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="manage-notes-upload-button"
            disabled={uploading}
          >
            {uploading ? (
              <LoaderCircle
                size={18}
                className="manage-notes-spin"
              />
            ) : (
              <Upload size={18} />
            )}
            {uploading ? "Uploading..." : "Upload as Draft"}
          </button>
        </form>
      </section>

      <section className="manage-notes-panel">
        <div className="manage-notes-list-header">
          <div>
            <h2>All Study Notes</h2>
            <p>Review, publish, or remove your materials.</p>
          </div>

          <label className="manage-notes-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notes..."
            />
          </label>
        </div>

        {loading ? (
          <div className="manage-notes-empty">
            <LoaderCircle
              size={28}
              className="manage-notes-spin"
            />
            <p>Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="manage-notes-empty">
            <BookOpen size={35} />
            <strong>
              {search ? "No matching notes" : "No notes uploaded yet"}
            </strong>
            <p>
              {search
                ? "Try searching for another title or subject."
                : "Upload your first PDF using the form above."}
            </p>
          </div>
        ) : (
          <div className="manage-notes-table-wrapper">
            <table className="manage-notes-table">
              <thead>
                <tr>
                  <th>Study Material</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredNotes.map((note) => (
                  <tr key={note._id}>
                    <td>
                      <div className="manage-notes-file-cell">
                        <span className="manage-notes-pdf-icon">
                          <FileText size={20} />
                        </span>
                        <div>
                          <strong>{note.title}</strong>
                          <span>
                            {note.description || "Study material"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{note.subject}</td>

                    <td>
                      <span
                        className={`manage-notes-status ${
                          note.isPublished
                            ? "is-published"
                            : "is-draft"
                        }`}
                      >
                        {note.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>

                    <td>
                      {note.createdAt
                        ? new Date(note.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <div className="manage-notes-actions">
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="manage-notes-action-button"
                          aria-label={`Open ${note.title}`}
                          title="Open PDF"
                        >
                          <Download size={17} />
                        </a>

                        <button
                          type="button"
                          className="manage-notes-action-button"
                          onClick={() => handlePublishToggle(note)}
                          disabled={actionId !== null || uploading}
                          title={
                            note.isPublished ? "Unpublish" : "Publish"
                          }
                          aria-label={
                            note.isPublished
                              ? `Unpublish ${note.title}`
                              : `Publish ${note.title}`
                          }
                        >
                          {actionId === note._id ? (
                            <LoaderCircle
                              size={17}
                              className="manage-notes-spin"
                            />
                          ) : note.isPublished ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="manage-notes-action-button delete"
                          onClick={() => handleDelete(note)}
                          disabled={actionId !== null || uploading}
                          title="Delete note"
                          aria-label={`Delete ${note.title}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ManageNotes;
