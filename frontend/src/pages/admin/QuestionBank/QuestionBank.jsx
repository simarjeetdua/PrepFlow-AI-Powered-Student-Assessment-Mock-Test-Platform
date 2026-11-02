
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  BookOpen,
  ClipboardList,
  CheckCircle,
  X,
  LoaderCircle,
  AlertCircle,
  CircleHelp,
  Save,
} from "lucide-react";

import api from "../../../services/api";
import "./QuestionBank.css";

const emptyForm = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  marks: 1,
};

const QuestionBank = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState("");

  const [questions, setQuestions] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // LOAD MOCK TESTS
  // --------------------------------------------------

  const loadTests = async () => {
    setLoadingTests(true);
    setError("");

    try {
      const response = await api.get("/mocktests");

      const data =
        response.data.mockTests ||
        response.data.tests ||
        response.data.data ||
        [];

      setTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load Mock Tests Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load mock tests."
      );
    } finally {
      setLoadingTests(false);
    }
  };

  // --------------------------------------------------
  // LOAD QUESTIONS FOR SELECTED TEST
  // --------------------------------------------------

  const loadQuestions = async (testId = selectedTest) => {
    if (!testId) {
      setQuestions([]);
      return;
    }

    setLoadingQuestions(true);
    setError("");

    try {
      const response = await api.get(
        `/questions/admin/test/${testId}`
      );

      setQuestions(response.data.questions || []);
    } catch (err) {
      console.error("Load Questions Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load questions."
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadQuestions(selectedTest);
    } else {
      setQuestions([]);
    }
  }, [selectedTest]);

  // --------------------------------------------------
  // FORM HANDLING
  // --------------------------------------------------

  const handleQuestionChange = (value) => {
    setForm((previous) => ({
      ...previous,
      questionText: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setForm((previous) => {
      const updatedOptions = [...previous.options];
      const oldOption = updatedOptions[index];

      updatedOptions[index] = value;

      return {
        ...previous,
        options: updatedOptions,
        correctAnswer:
          previous.correctAnswer === oldOption
            ? ""
            : previous.correctAnswer,
      };
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (question) => {
    const options = question.options || [];

    setForm({
      questionText: question.questionText || "",
      options: [
        ...options,
        ...Array(Math.max(0, 4 - options.length)).fill(""),
      ],
      correctAnswer: question.correctAnswer || "",
      marks: question.marks || 1,
    });

    setEditingId(question._id);
    setError("");
    setShowForm(true);
  };

  // --------------------------------------------------
  // CREATE / UPDATE QUESTION
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedTest) {
      setError("Please select a mock test first.");
      return;
    }

    const cleanedOptions = form.options
      .map((option) => option.trim())
      .filter(Boolean);

    if (!form.questionText.trim()) {
      setError("Please enter the question.");
      return;
    }

    if (cleanedOptions.length < 2) {
      setError("Please provide at least two options.");
      return;
    }

    if (
      new Set(cleanedOptions).size !== cleanedOptions.length
    ) {
      setError("Duplicate options are not allowed.");
      return;
    }

    if (!cleanedOptions.includes(form.correctAnswer)) {
      setError("Please select a valid correct answer.");
      return;
    }

    if (!Number.isFinite(Number(form.marks)) || Number(form.marks) < 1) {
      setError("Marks must be at least 1.");
      return;
    }

    const payload = {
      mockTest: selectedTest,
      questionText: form.questionText.trim(),
      options: cleanedOptions,
      correctAnswer: form.correctAnswer,
      marks: Number(form.marks),
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/questions/${editingId}`, payload);

        setSuccess("Question updated successfully.");
      } else {
        await api.post("/questions", payload);

        setSuccess("Question added successfully.");
      }

      resetForm();
      await loadQuestions(selectedTest);
    } catch (err) {
      console.error("Save Question Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save question."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE QUESTION
  // --------------------------------------------------

  const handleDelete = async (questionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/questions/${questionId}`);

      setQuestions((previous) =>
        previous.filter((question) => question._id !== questionId)
      );

      setSuccess("Question deleted successfully.");
    } catch (err) {
      console.error("Delete Question Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete question."
      );
    }
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return questions;

    return questions.filter((question) => {
      const text = question.questionText || "";

      return text.toLowerCase().includes(query);
    });
  }, [questions, search]);

  const totalMarks = questions.reduce(
    (sum, question) => sum + Number(question.marks || 0),
    0
  );

  const selectedTestData = tests.find(
    (test) => test._id === selectedTest
  );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="question-bank-page">

      {/* HEADER */}

      <header className="qb-header">
        <div>
          <span className="qb-eyebrow">
            QUESTION MANAGEMENT
          </span>

          <h1>Question Bank</h1>

          <p>
            Create, organize and manage questions for your mock tests.
          </p>
        </div>

        <button
          className="qb-primary-button"
          onClick={openAddForm}
          disabled={!selectedTest}
        >
          <Plus size={18} />
          Add Question
        </button>
      </header>

      {/* ALERTS */}

      {error && (
        <div className="qb-alert qb-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>

          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="qb-alert qb-success" role="status">
          <CheckCircle size={18} />
          <span>{success}</span>

          <button onClick={() => setSuccess("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* MOCK TEST SELECTOR */}

      <section className="qb-test-selector">
        <div className="qb-selector-heading">
          <ClipboardList size={21} />

          <div>
            <h2>Select Mock Test</h2>
            <p>
              Choose a mock test to manage its questions.
            </p>
          </div>
        </div>

        {loadingTests ? (
          <div className="qb-loading">
            <LoaderCircle className="qb-spin" size={22} />
            Loading mock tests...
          </div>
        ) : tests.length === 0 ? (
          <div className="qb-empty-test">
            <BookOpen size={25} />

            <div>
              <strong>No mock tests available</strong>
              <p>
                Create a mock test first, then add its questions here.
              </p>
            </div>

            <button
              className="qb-secondary-button"
              onClick={loadTests}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        ) : (
          <select
            value={selectedTest}
            onChange={(event) => {
              setSelectedTest(event.target.value);
              resetForm();
              setSuccess("");
            }}
          >
            <option value="">Select a mock test</option>

            {tests.map((test) => (
              <option key={test._id} value={test._id}>
                {test.title}
                {test.status ? ` (${test.status})` : ""}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* SUMMARY CARDS */}

      <section className="qb-summary-grid">
        <article className="qb-summary-card">
          <span className="qb-summary-icon">
            <CircleHelp size={23} />
          </span>

          <div>
            <p>Total Questions</p>
            <strong>
              {loadingQuestions ? "—" : questions.length}
            </strong>
          </div>
        </article>

        <article className="qb-summary-card">
          <span className="qb-summary-icon qb-green">
            <CheckCircle size={23} />
          </span>

          <div>
            <p>Available Marks</p>
            <strong>
              {loadingQuestions ? "—" : totalMarks}
            </strong>
          </div>
        </article>

        <article className="qb-summary-card">
          <span className="qb-summary-icon qb-purple">
            <BookOpen size={23} />
          </span>

          <div>
            <p>Selected Mock Test</p>
            <strong className="qb-test-title">
              {selectedTestData?.title || "Not selected"}
            </strong>
          </div>
        </article>
      </section>

      {/* QUESTIONS PANEL */}

      <section className="qb-panel">

        <div className="qb-panel-header">
          <div>
            <h2>Questions</h2>
            <p>
              Manage the questions assigned to this mock test.
            </p>
          </div>

          <div className="qb-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search questions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {!selectedTest ? (
          <div className="qb-empty">
            <ClipboardList size={38} />

            <strong>Select a mock test</strong>

            <p>
              Select a mock test above to view and manage its questions.
            </p>
          </div>
        ) : loadingQuestions ? (
          <div className="qb-empty">
            <LoaderCircle className="qb-spin" size={30} />
            <p>Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="qb-empty">
            <CircleHelp size={38} />

            <strong>
              {search
                ? "No matching questions found"
                : "No questions added yet"}
            </strong>

            <p>
              {search
                ? "Try a different search term."
                : "Start building your mock test by adding questions."}
            </p>

            {!search && (
              <button
                className="qb-primary-button"
                onClick={openAddForm}
              >
                <Plus size={17} />
                Add First Question
              </button>
            )}
          </div>
        ) : (
          <div className="qb-question-list">
            {filteredQuestions.map((question, index) => (
              <article
                className="qb-question-card"
                key={question._id}
              >
                <div className="qb-question-top">
                  <div className="qb-question-number">
                    Question {index + 1}
                  </div>

                  <div className="qb-question-actions">
                    <span className="qb-marks">
                      {question.marks} {Number(question.marks) === 1 ? "Mark" : "Marks"}
                    </span>

                    <button
                      className="qb-icon-button"
                      title="Edit question"
                      onClick={() => openEditForm(question)}
                    >
                      <Edit size={17} />
                    </button>

                    <button
                      className="qb-icon-button qb-delete"
                      title="Delete question"
                      onClick={() => handleDelete(question._id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <h3>{question.questionText}</h3>

                <div className="qb-options-list">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={`${question._id}-${optionIndex}`}
                      className={`qb-option ${
                        option === question.correctAnswer
                          ? "qb-correct-option"
                          : ""
                      }`}
                    >
                      <span>
                        {String.fromCharCode(65 + optionIndex)}
                      </span>

                      <p>{option}</p>

                      {option === question.correctAnswer && (
                        <CheckCircle
                          size={17}
                          className="qb-correct-icon"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ADD / EDIT MODAL */}

      {showForm && (
        <div
          className="qb-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              resetForm();
            }
          }}
        >
          <section className="qb-modal">
            <header className="qb-modal-header">
              <div>
                <span className="qb-eyebrow">
                  QUESTION BANK
                </span>

                <h2>
                  {editingId ? "Edit Question" : "Add New Question"}
                </h2>

                <p>
                  Add question details and select the correct answer.
                </p>
              </div>

              <button
                className="qb-modal-close"
                onClick={resetForm}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="qb-form-body">

                <label className="qb-field">
                  <span>Question Text *</span>

                  <textarea
                    value={form.questionText}
                    onChange={(event) =>
                      handleQuestionChange(event.target.value)
                    }
                    placeholder="Enter your question..."
                    rows={3}
                    required
                  />
                </label>

                <div className="qb-options-heading">
                  <strong>Answer Options</strong>
                  <span>Enter at least two options.</span>
                </div>

                {form.options.map((option, index) => (
                  <label
                    className="qb-field qb-option-field"
                    key={index}
                  >
                    <span>Option {String.fromCharCode(65 + index)}</span>

                    <input
                      type="text"
                      value={option}
                      onChange={(event) =>
                        handleOptionChange(index, event.target.value)
                      }
                      placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                    />
                  </label>
                ))}

                <label className="qb-field">
                  <span>Correct Answer *</span>

                  <select
                    value={form.correctAnswer}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        correctAnswer: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select correct answer</option>

                    {form.options
                      .filter((option) => option.trim())
                      .map((option, index) => (
                        <option key={index} value={option}>
                          {String.fromCharCode(65 + index)}. {option}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="qb-field">
                  <span>Marks *</span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.marks}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        marks: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

              </div>

              <footer className="qb-modal-footer">
                <button
                  type="button"
                  className="qb-secondary-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="qb-primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <LoaderCircle className="qb-spin" size={17} />
                  ) : (
                    <Save size={17} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Question"
                      : "Save Question"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
