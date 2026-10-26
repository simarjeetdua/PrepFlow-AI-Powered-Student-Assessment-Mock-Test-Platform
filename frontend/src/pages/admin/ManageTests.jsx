
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  X,
  LoaderCircle,
  FileQuestion,
} from "lucide-react";

import api from "../../services/api";
import "./ManageTests.css";

const emptyForm = {
  title: "",
  description: "",
  duration: 30,
  totalQuestions: 10,
  difficulty: "Medium",
  status: "Draft",
};

const ManageTests = () => {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadTests = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/mocktests");
      setTests(response.data.mockTests || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load mock tests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "duration" || name === "totalQuestions"
          ? value
          : value,
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (test) => {
    setEditingId(test._id);
    setForm({
      title: test.title || "",
      description: test.description || "",
      duration: test.duration ?? 30,
      totalQuestions: test.totalQuestions ?? 10,
      difficulty: test.difficulty || "Medium",
      status: test.status || "Draft",
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

    const duration = Number(form.duration);
    const totalQuestions = Number(form.totalQuestions);

    if (
      !form.title.trim() ||
      !Number.isInteger(duration) ||
      duration <= 0 ||
      !Number.isInteger(totalQuestions) ||
      totalQuestions <= 0
    ) {
      setError(
        "Enter a title, a positive whole-number duration, and a positive number of questions."
      );
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      duration,
      totalQuestions,
      difficulty: form.difficulty,
      status: form.status,
    };

    setSaving(true);

    try {
      const response = editingId
        ? await api.put(`/mocktests/${editingId}`, payload)
        : await api.post("/mocktests", payload);

      setMessage(
        response.data.message ||
          (editingId
            ? "Mock test updated successfully."
            : "Mock test created successfully.")
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadTests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the mock test."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (test) => {
    const nextStatus =
      test.status === "Published" ? "Draft" : "Published";

    setActionId(test._id);
    setError("");
    setMessage("");

    try {
      await api.put(`/mocktests/${test._id}`, {
        title: test.title,
        description: test.description || "",
        duration: Number(test.duration),
        totalQuestions: Number(test.totalQuestions),
        difficulty: test.difficulty,
        status: nextStatus,
      });

      setMessage(
        nextStatus === "Published"
          ? "Mock test published successfully."
          : "Mock test unpublished successfully."
      );

      await loadTests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to change the publication status."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (test) => {
    const confirmed = window.confirm(
      `Delete the mock test "${test.title}"?`
    );

    if (!confirmed) return;

    setActionId(test._id);
    setError("");
    setMessage("");

    try {
      const response = await api.delete(
        `/mocktests/${test._id}`
      );

      setTests((previous) =>
        previous.filter((item) => item._id !== test._id)
      );

      setMessage(
        response.data.message || "Mock test deleted successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the mock test."
      );
    } finally {
      setActionId(null);
    }
  };

  const filteredTests = tests.filter((test) => {
    const query = search.toLowerCase().trim();

    return (
      test.title?.toLowerCase().includes(query) ||
      test.description?.toLowerCase().includes(query) ||
      test.difficulty?.toLowerCase().includes(query)
    );
  });

  const publishedCount = tests.filter(
    (test) => test.status === "Published"
  ).length;

  return (
    <div className="manage-tests-page">
      <header className="manage-tests-header">
        <div>
          <span className="manage-tests-eyebrow">
            ASSESSMENT MANAGEMENT
          </span>
          <h1>Mock Tests</h1>
          <p>
            Create assessments and manage their publication status.
          </p>
        </div>

        <button
          type="button"
          className="manage-tests-primary-button"
          onClick={openCreateForm}
          disabled={loading || saving || actionId !== null}
        >
          <Plus size={18} />
          Create Test
        </button>
      </header>

      {error && (
        <div className="manage-tests-alert error" role="alert">
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
        <div className="manage-tests-alert success" role="status">
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

      <section className="manage-tests-stats">
        <article className="manage-tests-stat-card">
          <span className="manage-tests-stat-icon">
            <ClipboardList size={22} />
          </span>
          <div>
            <p>Total Tests</p>
            <strong>{loading ? "—" : tests.length}</strong>
          </div>
        </article>

        <article className="manage-tests-stat-card">
          <span className="manage-tests-stat-icon published">
            <Eye size={22} />
          </span>
          <div>
            <p>Published</p>
            <strong>{loading ? "—" : publishedCount}</strong>
          </div>
        </article>

        <article className="manage-tests-stat-card">
          <span className="manage-tests-stat-icon drafts">
            <FileQuestion size={22} />
          </span>
          <div>
            <p>Drafts</p>
            <strong>
              {loading ? "—" : tests.length - publishedCount}
            </strong>
          </div>
        </article>
      </section>

      {showForm && (
        <section className="manage-tests-panel">
          <div className="manage-tests-panel-heading">
            <div>
              <h2>{editingId ? "Edit Mock Test" : "Create Mock Test"}</h2>
              <p>
                {editingId
                  ? "Update the assessment details."
                  : "Set up a new assessment."}
              </p>
            </div>

            <button
              type="button"
              className="manage-tests-icon-button"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close form"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="manage-tests-form-grid">
              <label>
                Test Title *
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. DBMS Assessment"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Duration (minutes) *
                <input
                  name="duration"
                  type="number"
                  min="1"
                  step="1"
                  value={form.duration}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Total Questions *
                <input
                  name="totalQuestions"
                  type="number"
                  min="1"
                  step="1"
                  value={form.totalQuestions}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Difficulty *
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  required
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </label>

              <label>
                Publication Status *
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </label>

              <label className="full-width">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the assessment..."
                  maxLength={1000}
                />
              </label>
            </div>

            <div className="manage-tests-form-actions">
              <button
                type="button"
                className="manage-tests-secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="manage-tests-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle
                    size={18}
                    className="manage-tests-spin"
                  />
                ) : (
                  <Plus size={18} />
                )}
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Test"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="manage-tests-panel">
        <div className="manage-tests-list-heading">
          <div>
            <h2>All Mock Tests</h2>
            <p>Review assessments and manage visibility.</p>
          </div>

          <div className="manage-tests-list-controls">
            <label className="manage-tests-search">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tests..."
                aria-label="Search mock tests"
              />
            </label>

            <button
              type="button"
              className="manage-tests-refresh"
              onClick={loadTests}
              disabled={loading || saving || actionId !== null}
              aria-label="Refresh tests"
              title="Refresh"
            >
              <RefreshCw
                size={17}
                className={loading ? "manage-tests-spin" : ""}
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="manage-tests-empty">
            <LoaderCircle
              size={28}
              className="manage-tests-spin"
            />
            <p>Loading mock tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="manage-tests-empty">
            <ClipboardList size={35} />
            <strong>
              {search ? "No matching tests" : "No mock tests found"}
            </strong>
            <p>
              {search
                ? "Try a different search term."
                : "Create your first mock test to get started."}
            </p>
          </div>
        ) : (
          <div className="manage-tests-table-wrapper">
            <table className="manage-tests-table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test._id}>
                    <td>
                      <div className="manage-tests-title-cell">
                        <span className="manage-tests-test-icon">
                          <ClipboardList size={19} />
                        </span>
                        <div>
                          <strong>{test.title}</strong>
                          <span>
                            {test.description || "Mock assessment"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{test.duration} min</td>
                    <td>{test.totalQuestions}</td>

                    <td>
                      <span
                        className={`manage-tests-difficulty ${(
                          test.difficulty || "medium"
                        ).toLowerCase()}`}
                      >
                        {test.difficulty}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`manage-tests-status ${
                          test.status === "Published"
                            ? "published"
                            : "draft"
                        }`}
                      >
                        {test.status}
                      </span>
                    </td>

                    <td>
                      <div className="manage-tests-actions">
                        <button
                          type="button"
                          className="manage-tests-icon-button"
                          onClick={() => openEditForm(test)}
                          disabled={actionId !== null || saving}
                          title="Edit test"
                          aria-label={`Edit ${test.title}`}
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          className="manage-tests-icon-button"
                          onClick={() => handleTogglePublish(test)}
                          disabled={actionId !== null || saving}
                          title={
                            test.status === "Published"
                              ? "Unpublish test"
                              : "Publish test"
                          }
                          aria-label={`${
                            test.status === "Published"
                              ? "Unpublish"
                              : "Publish"
                          } ${test.title}`}
                        >
                          {actionId === test._id ? (
                            <LoaderCircle
                              size={16}
                              className="manage-tests-spin"
                            />
                          ) : test.status === "Published" ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="manage-tests-icon-button delete"
                          onClick={() => handleDelete(test)}
                          disabled={actionId !== null || saving}
                          title="Delete test"
                          aria-label={`Delete ${test.title}`}
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
        )}
      </section>
    </div>
  );
};

export default ManageTests;
