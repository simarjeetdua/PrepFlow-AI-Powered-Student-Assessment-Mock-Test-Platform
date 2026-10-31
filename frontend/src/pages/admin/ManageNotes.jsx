import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Layers,
  LoaderCircle,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import api from "../../services/api";
import "./ManageNotes.css";

const emptyForm = { title: "", description: "", subject: "" };
const MAX_SIZE = 10 * 1024 * 1024;
const PAGE_SIZE = 10;

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
];

const formatDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const formatSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const isCancel = (err) =>
  err?.code === "ERR_CANCELED" ||
  err?.name === "CanceledError" ||
  err?.name === "AbortError";

/* ---------- Accessible dialog (portal, Esc to close, scroll lock) ---------- */

const Dialog = ({
  title,
  description,
  onClose,
  locked = false,
  small = false,
  children,
  footer,
}) => {
  const dialogRef = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  const lockedRef = useRef(locked);

  closeRef.current = onClose;
  lockedRef.current = locked;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;

    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKey = (event) => {
      if (event.key === "Escape" && !lockedRef.current) closeRef.current?.();
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      className="manage-notes-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !locked) onClose?.();
      }}
    >
      <section
        ref={dialogRef}
        className={`manage-notes-dialog${small ? " small" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="manage-notes-dialog-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            type="button"
            className="manage-notes-icon-button"
            onClick={onClose}
            disabled={locked}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="manage-notes-dialog-body">{children}</div>

        {footer && <div className="manage-notes-dialog-foot">{footer}</div>}
      </section>
    </div>,
    document.body
  );
};

/* ---------- Page ---------- */

const ManageNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // upload dialog
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const abortRef = useRef(null);

  // list controls
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

  // row / bulk actions
  const [actionId, setActionId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmState, setConfirmState] = useState(null);

  /* ----- data ----- */

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/notes/admin");
      setNotes(response.data.notes || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load study notes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Success messages dismiss themselves.
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  // Back to page 1 whenever the filters change.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, subjectFilter, sort]);

  // Forget selections for notes that no longer exist.
  useEffect(() => {
    setSelected((previous) => {
      const ids = new Set(notes.map((note) => note._id));
      const next = new Set([...previous].filter((id) => ids.has(id)));
      return next.size === previous.size ? previous : next;
    });
  }, [notes]);

  /* ----- derived ----- */

  const subjects = useMemo(
    () =>
      [...new Set(notes.map((note) => note.subject).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [notes]
  );

  const publishedCount = notes.filter((note) => note.isPublished).length;
  const draftCount = notes.length - publishedCount;

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    const list = notes.filter((note) => {
      const matchesSearch =
        !query ||
        note.title?.toLowerCase().includes(query) ||
        note.subject?.toLowerCase().includes(query) ||
        note.description?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && note.isPublished) ||
        (statusFilter === "draft" && !note.isPublished);

      const matchesSubject =
        subjectFilter === "all" || note.subject === subjectFilter;

      return matchesSearch && matchesStatus && matchesSubject;
    });

    const time = (note) => new Date(note.createdAt || 0).getTime();

    list.sort((a, b) => {
      if (sort === "oldest") return time(a) - time(b);
      if (sort === "title") return (a.title || "").localeCompare(b.title || "");
      if (sort === "subject")
        return (a.subject || "").localeCompare(b.subject || "");
      return time(b) - time(a);
    });

    return list;
  }, [notes, search, statusFilter, subjectFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageNotes = filteredNotes.slice(pageStart, pageStart + PAGE_SIZE);

  const selectedOnPage = pageNotes.filter((note) => selected.has(note._id));
  const allOnPageSelected =
    pageNotes.length > 0 && selectedOnPage.length === pageNotes.length;
  const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected;

  const filtersActive =
    Boolean(search.trim()) || statusFilter !== "all" || subjectFilter !== "all";

  const busy = loading || uploading || bulkBusy || actionId !== null;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSubjectFilter("all");
  };

  const statusCount = { all: notes.length, published: publishedCount, draft: draftCount };

  /* ----- confirm ----- */

  const askConfirm = (options) =>
    new Promise((resolve) => setConfirmState({ ...options, resolve }));

  const answerConfirm = (result) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  /* ----- upload dialog ----- */

  const openForm = () => {
    setForm(emptyForm);
    setFile(null);
    setFormError("");
    setProgress(0);
    setShowForm(true);
  };

  const closeForm = () => {
    if (uploading) return;
    setShowForm(false);
    setForm(emptyForm);
    setFile(null);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const acceptFile = (candidate) => {
    setFormError("");

    if (!candidate) {
      setFile(null);
      return;
    }

    const isPdf =
      candidate.name.toLowerCase().endsWith(".pdf") &&
      (candidate.type === "" || candidate.type === "application/pdf");

    if (!isPdf) {
      setFile(null);
      setFormError("Choose a PDF file.");
      return;
    }

    if (candidate.size === 0) {
      setFile(null);
      setFormError("That PDF is empty.");
      return;
    }

    if (candidate.size > MAX_SIZE) {
      setFile(null);
      setFormError("The PDF must be 10 MB or smaller.");
      return;
    }

    setFile(candidate);

    // Suggest a title from the file name when none has been typed.
    setForm((previous) =>
      previous.title
        ? previous
        : {
            ...previous,
            title: candidate.name
              .replace(/\.pdf$/i, "")
              .replace(/[_-]+/g, " ")
              .trim()
              .slice(0, 150),
          }
    );
  };

  const handleFileInput = (event) => {
    acceptFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    if (uploading) return;
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.title.trim() || !form.subject.trim() || !file) {
      setFormError("Add a title, a subject and a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("subject", form.subject.trim());
    formData.append("file", file);

    const controller = new AbortController();
    abortRef.current = controller;

    setUploading(true);
    setProgress(0);

    try {
      const response = await api.post("/notes", formData, {
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || file.size;
          setProgress(
            Math.min(100, Math.round((progressEvent.loaded / total) * 100))
          );
        },
      });

      setMessage(response.data.message || "PDF uploaded as a draft.");
      setShowForm(false);
      setForm(emptyForm);
      setFile(null);
      setSort("newest");
      setStatusFilter("all");

      await loadNotes();
    } catch (err) {
      setFormError(
        isCancel(err)
          ? "Upload cancelled."
          : err.response?.data?.message || "Failed to upload the PDF."
      );
    } finally {
      abortRef.current = null;
      setUploading(false);
    }
  };

  /* ----- single-note actions ----- */

  const handlePublishToggle = async (note) => {
    setActionId(note._id);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(`/notes/${note._id}/publish`);

      setNotes((previous) =>
        previous.map((item) =>
          item._id === note._id
            ? { ...item, isPublished: response.data.note.isPublished }
            : item
        )
      );

      setMessage(response.data.message || "Note status updated.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update publication status."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (note) => {
    const confirmed = await askConfirm({
      title: "Delete this note?",
      body: `“${note.title}” and its PDF will be removed permanently. Students will no longer be able to open it.`,
      confirmLabel: "Delete note",
    });

    if (!confirmed) return;

    setActionId(note._id);
    setError("");
    setMessage("");

    try {
      const response = await api.delete(`/notes/${note._id}`);

      setNotes((previous) => previous.filter((item) => item._id !== note._id));
      setMessage(response.data.message || "Note deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete the note.");
    } finally {
      setActionId(null);
    }
  };

  const handleCopyLink = async (note) => {
    try {
      await navigator.clipboard.writeText(note.fileUrl);
      setError("");
      setMessage("PDF link copied to the clipboard.");
    } catch {
      setError("Couldn't copy the link. Copy it from the Open PDF button instead.");
    }
  };

  /* ----- selection & bulk actions ----- */

  const toggleOne = (id) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (allOnPageSelected) pageNotes.forEach((note) => next.delete(note._id));
      else pageNotes.forEach((note) => next.add(note._id));
      return next;
    });
  };

  const summarize = (done, failed, verb) =>
    failed
      ? `${verb} ${done} note${done === 1 ? "" : "s"}. ${failed} failed — try those again.`
      : `${verb} ${done} note${done === 1 ? "" : "s"}.`;

  const handleBulkPublish = async (publish) => {
    const targets = notes.filter(
      (note) => selected.has(note._id) && Boolean(note.isPublished) !== publish
    );

    if (targets.length === 0) {
      setMessage(
        publish
          ? "The selected notes are already published."
          : "The selected notes are already drafts."
      );
      return;
    }

    setBulkBusy(true);
    setError("");
    setMessage("");

    const results = await Promise.allSettled(
      targets.map((note) => api.patch(`/notes/${note._id}/publish`))
    );

    const updates = new Map();
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        updates.set(
          targets[index]._id,
          result.value.data.note?.isPublished ?? publish
        );
      }
    });

    setNotes((previous) =>
      previous.map((note) =>
        updates.has(note._id)
          ? { ...note, isPublished: updates.get(note._id) }
          : note
      )
    );

    const failed = targets.length - updates.size;
    const text = summarize(updates.size, failed, publish ? "Published" : "Moved to drafts:");

    if (failed) setError(text);
    else setMessage(text);

    setSelected(new Set());
    setBulkBusy(false);
  };

  const handleBulkDelete = async () => {
    const targets = notes.filter((note) => selected.has(note._id));
    if (targets.length === 0) return;

    const confirmed = await askConfirm({
      title: `Delete ${targets.length} note${targets.length === 1 ? "" : "s"}?`,
      body: "The selected notes and their PDFs will be removed permanently.",
      confirmLabel: `Delete ${targets.length}`,
    });

    if (!confirmed) return;

    setBulkBusy(true);
    setError("");
    setMessage("");

    const results = await Promise.allSettled(
      targets.map((note) => api.delete(`/notes/${note._id}`))
    );

    const removed = new Set();
    results.forEach((result, index) => {
      if (result.status === "fulfilled") removed.add(targets[index]._id);
    });

    setNotes((previous) => previous.filter((note) => !removed.has(note._id)));

    const failed = targets.length - removed.size;
    const text = summarize(removed.size, failed, "Deleted");

    if (failed) setError(text);
    else setMessage(text);

    setSelected(new Set());
    setBulkBusy(false);
  };

  /* ----- render ----- */

  return (
    <div className="manage-notes-page">
      <header className="manage-notes-header">
        <div>
          <h1>Notes &amp; PDFs</h1>
          <p>
            Upload study material, then publish it when students should see it.
          </p>
        </div>

        <div className="manage-notes-header-actions">
          <button
            type="button"
            className="manage-notes-button"
            onClick={loadNotes}
            disabled={busy}
          >
            <RefreshCw
              size={16}
              className={loading ? "manage-notes-spin" : ""}
              aria-hidden="true"
            />
            Refresh
          </button>

          <button
            type="button"
            className="manage-notes-button primary"
            onClick={openForm}
            disabled={loading || uploading || bulkBusy}
          >
            <Upload size={16} aria-hidden="true" />
            Upload PDF
          </button>
        </div>
      </header>

      {error && (
        <div className="manage-notes-alert error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      {message && (
        <div className="manage-notes-alert success" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="manage-notes-stats" aria-label="Notes summary">
        {[
          { label: "All notes", value: notes.length, icon: BookOpen, tone: "" },
          { label: "Published", value: publishedCount, icon: Eye, tone: "published" },
          { label: "Drafts", value: draftCount, icon: FileText, tone: "drafts" },
          { label: "Subjects", value: subjects.length, icon: Layers, tone: "subjects" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article className="manage-notes-stat-card" key={label}>
            <span className={`manage-notes-stat-icon ${tone}`}>
              <Icon size={21} aria-hidden="true" />
            </span>
            <div>
              <p>{label}</p>
              <strong>{loading ? "—" : value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="manage-notes-panel">
        <div className="manage-notes-panel-head">
          <div>
            <h2>Study notes</h2>
            <p>
              {loading
                ? "Loading your materials..."
                : filtersActive
                  ? `${filteredNotes.length} of ${notes.length} notes match your filters.`
                  : "Review, publish or remove your materials."}
            </p>
          </div>

          <div className="manage-notes-tabs" role="group" aria-label="Filter by status">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={statusFilter === tab.key ? "active" : ""}
                aria-pressed={statusFilter === tab.key}
                onClick={() => setStatusFilter(tab.key)}
              >
                {tab.label}
                <span>{loading ? "–" : statusCount[tab.key]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="manage-notes-toolbar">
          <label className="manage-notes-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, subject or description"
              aria-label="Search notes"
            />
          </label>

          <select
            className="manage-notes-select"
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            aria-label="Filter by subject"
          >
            <option value="all">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <select
            className="manage-notes-select"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort notes"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
            <option value="subject">Subject A–Z</option>
          </select>

          {filtersActive && (
            <button type="button" className="manage-notes-link" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {selected.size > 0 && (
          <div className="manage-notes-bulkbar" role="region" aria-label="Bulk actions">
            <strong>{selected.size} selected</strong>

            <div>
              <button
                type="button"
                className="manage-notes-button small"
                onClick={() => handleBulkPublish(true)}
                disabled={busy}
              >
                <Eye size={15} />
                Publish
              </button>
              <button
                type="button"
                className="manage-notes-button small"
                onClick={() => handleBulkPublish(false)}
                disabled={busy}
              >
                <EyeOff size={15} />
                Unpublish
              </button>
              <button
                type="button"
                className="manage-notes-button small danger"
                onClick={handleBulkDelete}
                disabled={busy}
              >
                {bulkBusy ? (
                  <LoaderCircle size={15} className="manage-notes-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
                Delete
              </button>
              <button
                type="button"
                className="manage-notes-link"
                onClick={() => setSelected(new Set())}
                disabled={bulkBusy}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="manage-notes-skeletons" role="status" aria-label="Loading notes">
            {[0, 1, 2, 3, 4].map((row) => (
              <div className="manage-notes-skeleton-row" key={row}>
                <span />
                <div>
                  <i />
                  <i />
                </div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="manage-notes-empty">
            <BookOpen size={34} aria-hidden="true" />
            <strong>{error ? "Notes unavailable" : "No notes yet"}</strong>
            <p>
              {error
                ? "Fix the error above, then refresh."
                : "Upload your first PDF. It stays a draft until you publish it."}
            </p>
            {!error && (
              <button type="button" className="manage-notes-button primary" onClick={openForm}>
                <Upload size={16} />
                Upload PDF
              </button>
            )}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="manage-notes-empty">
            <Search size={34} aria-hidden="true" />
            <strong>No matching notes</strong>
            <p>Try a different search, subject or status.</p>
            <button type="button" className="manage-notes-button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="manage-notes-table-wrapper">
              <table className="manage-notes-table">
                <thead>
                  <tr>
                    <th className="manage-notes-check-col">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        ref={(element) => {
                          if (element) element.indeterminate = someOnPageSelected;
                        }}
                        onChange={toggleAllOnPage}
                        disabled={busy}
                        aria-label="Select all notes on this page"
                      />
                    </th>
                    <th>Material</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pageNotes.map((note) => (
                    <tr
                      key={note._id}
                      className={selected.has(note._id) ? "selected" : ""}
                    >
                      <td className="manage-notes-check-col">
                        <input
                          type="checkbox"
                          checked={selected.has(note._id)}
                          onChange={() => toggleOne(note._id)}
                          disabled={busy}
                          aria-label={`Select ${note.title}`}
                        />
                      </td>

                      <td className="manage-notes-main-cell">
                        <div className="manage-notes-file-cell">
                          <span className="manage-notes-pdf-icon">
                            <FileText size={19} aria-hidden="true" />
                          </span>
                          <div>
                            <strong>{note.title}</strong>
                            <span>{note.description || "No description"}</span>
                          </div>
                        </div>
                      </td>

                      <td data-label="Subject">{note.subject}</td>

                      <td data-label="Status">
                        <span
                          className={`manage-notes-status ${
                            note.isPublished ? "is-published" : "is-draft"
                          }`}
                        >
                          {note.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td data-label="Uploaded">{formatDate(note.createdAt)}</td>

                      <td data-label="Actions">
                        <div className="manage-notes-actions">
                          <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="manage-notes-icon-button"
                            aria-label={`Open ${note.title}`}
                            title="Open PDF"
                          >
                            <ExternalLink size={16} />
                          </a>

                          <button
                            type="button"
                            className="manage-notes-icon-button"
                            onClick={() => handleCopyLink(note)}
                            title="Copy PDF link"
                            aria-label={`Copy link to ${note.title}`}
                          >
                            <Copy size={16} />
                          </button>

                          <button
                            type="button"
                            className="manage-notes-icon-button"
                            onClick={() => handlePublishToggle(note)}
                            disabled={busy}
                            title={note.isPublished ? "Unpublish" : "Publish"}
                            aria-label={`${note.isPublished ? "Unpublish" : "Publish"} ${note.title}`}
                          >
                            {actionId === note._id ? (
                              <LoaderCircle size={16} className="manage-notes-spin" />
                            ) : note.isPublished ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>

                          <button
                            type="button"
                            className="manage-notes-icon-button danger"
                            onClick={() => handleDelete(note)}
                            disabled={busy}
                            title="Delete"
                            aria-label={`Delete ${note.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="manage-notes-pagination">
              <span>
                Showing {pageStart + 1}–{pageStart + pageNotes.length} of{" "}
                {filteredNotes.length}
              </span>

              {totalPages > 1 && (
                <div>
                  <button
                    type="button"
                    className="manage-notes-icon-button"
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <span aria-live="polite">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="manage-notes-icon-button"
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {showForm && (
        <Dialog
          title="Upload a PDF"
          description="It's saved as a draft until you publish it."
          onClose={closeForm}
          locked={uploading}
          footer={
            uploading ? (
              <button
                type="button"
                className="manage-notes-button"
                onClick={() => abortRef.current?.abort()}
              >
                Cancel upload
              </button>
            ) : (
              <>
                <button type="button" className="manage-notes-button" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" form="manage-notes-form" className="manage-notes-button primary">
                  <Upload size={16} />
                  Upload as draft
                </button>
              </>
            )
          }
        >
          {formError && (
            <div className="manage-notes-alert error" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <form id="manage-notes-form" className="manage-notes-form" onSubmit={handleUpload}>
            <label
              className={`manage-notes-drop${file ? " has-file" : ""}${dragOver ? " drag-over" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                if (!uploading) setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                disabled={uploading}
                className="manage-notes-visually-hidden"
              />
              <FileText size={26} aria-hidden="true" />
              <span>
                <strong>{file ? file.name : "Drop a PDF here, or click to choose"}</strong>
                <small>
                  {file ? `${formatSize(file.size)} · click to replace` : "PDF only, up to 10 MB"}
                </small>
              </span>
            </label>

            <label className="manage-notes-field">
              Title
              <input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="DBMS complete notes"
                maxLength={150}
                disabled={uploading}
                required
              />
            </label>

            <label className="manage-notes-field">
              Subject
              <input
                name="subject"
                value={form.subject}
                onChange={handleFormChange}
                placeholder="Database management"
                maxLength={100}
                list="manage-notes-subjects"
                disabled={uploading}
                required
              />
              <datalist id="manage-notes-subjects">
                {subjects.map((subject) => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>
            </label>

            <label className="manage-notes-field full">
              Description (optional)
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="What does this material cover?"
                rows={3}
                maxLength={1000}
                disabled={uploading}
              />
              <small>{form.description.length}/1000</small>
            </label>
          </form>

          {uploading && (
            <div
              className="manage-notes-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label="Upload progress"
            >
              <div>
                <span style={{ width: `${progress}%` }} />
              </div>
              <small>
                {progress < 100 ? `Uploading… ${progress}%` : "Processing…"}
              </small>
            </div>
          )}
        </Dialog>
      )}

      {confirmState && (
        <Dialog title={confirmState.title} small onClose={() => answerConfirm(false)}
          footer={
            <>
              <button type="button" className="manage-notes-button" onClick={() => answerConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="manage-notes-button danger solid" onClick={() => answerConfirm(true)}>
                {confirmState.confirmLabel || "Delete"}
              </button>
            </>
          }
        >
          <p className="manage-notes-confirm-text">{confirmState.body}</p>
        </Dialog>
      )}
    </div>
  );
};

export default ManageNotes;