
import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Users,
  ClipboardCheck,
  Target,
  Search,
  RefreshCw,
  X,
  LoaderCircle,
  Trophy,
  Eye,
  CalendarDays,
} from "lucide-react";

import api from "../../services/api";
import "./StudentPerformance.css";

const StudentPerformance = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadPerformance = async () => {
    setLoading(true);
    setError("");

    try {
      // This admin-only endpoint must return aggregated student performance.
      const response = await api.get("/admin/performance");
      setStudents(response.data.students || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load student performance. Check the admin performance API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        (student.name || "").toLowerCase().includes(query) ||
        (student.email || "").toLowerCase().includes(query);

      const average = Number(student.averageScore || 0);

      const matchesScore =
        scoreFilter === "all" ||
        (scoreFilter === "high" && average >= 80) ||
        (scoreFilter === "medium" && average >= 50 && average < 80) ||
        (scoreFilter === "low" && average < 50);

      return matchesSearch && matchesScore;
    });
  }, [students, search, scoreFilter]);

  const summary = useMemo(() => {
    const totalAttempts = students.reduce(
      (sum, student) => sum + Number(student.totalAttempts || 0),
      0
    );

    const scores = students.filter(
      (student) => Number(student.totalAttempts || 0) > 0
    );

    const averageScore = scores.length
      ? scores.reduce(
          (sum, student) => sum + Number(student.averageScore || 0),
          0
        ) / scores.length
      : 0;

    return {
      totalStudents: students.length,
      totalAttempts,
      averageScore,
      activeStudents: scores.length,
    };
  }, [students]);

  const formatScore = (score) =>
    `${Number(score || 0).toFixed(1)}%`;

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "—"
      : parsed.toLocaleDateString();
  };

  return (
    <div className="student-performance-page">
      <header className="performance-header">
        <div>
          <span className="performance-eyebrow">
            ACADEMIC ANALYTICS
          </span>
          <h1>Student Performance</h1>
          <p>
            Monitor assessment attempts, average scores, and student progress.
          </p>
        </div>

        <button
          type="button"
          className="performance-refresh-button"
          onClick={loadPerformance}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "performance-spin" : ""}
          />
          Refresh
        </button>
      </header>

      {error && (
        <div className="performance-alert" role="alert">
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

      <section className="performance-summary-grid">
        <article className="performance-summary-card">
          <span className="performance-summary-icon">
            <Users size={22} />
          </span>
          <div>
            <p>Total Students</p>
            <strong>
              {loading ? "—" : summary.totalStudents}
            </strong>
            <span>Registered student accounts</span>
          </div>
        </article>

        <article className="performance-summary-card">
          <span className="performance-summary-icon attempts">
            <ClipboardCheck size={22} />
          </span>
          <div>
            <p>Total Attempts</p>
            <strong>
              {loading ? "—" : summary.totalAttempts}
            </strong>
            <span>Recorded assessment attempts</span>
          </div>
        </article>

        <article className="performance-summary-card">
          <span className="performance-summary-icon average">
            <Target size={22} />
          </span>
          <div>
            <p>Average Score</p>
            <strong>
              {loading ? "—" : formatScore(summary.averageScore)}
            </strong>
            <span>Average across students with attempts</span>
          </div>
        </article>

        <article className="performance-summary-card">
          <span className="performance-summary-icon active">
            <TrendingUp size={22} />
          </span>
          <div>
            <p>Attempted Tests</p>
            <strong>
              {loading ? "—" : summary.activeStudents}
            </strong>
            <span>Students with at least one attempt</span>
          </div>
        </article>
      </section>

      <section className="performance-panel">
        <div className="performance-list-heading">
          <div>
            <h2>Student Results Overview</h2>
            <p>Search students and compare their average scores.</p>
          </div>

          <div className="performance-controls">
            <label className="performance-search">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email..."
                aria-label="Search students"
              />
            </label>

            <select
              value={scoreFilter}
              onChange={(event) => setScoreFilter(event.target.value)}
              aria-label="Filter students by average score"
              className="performance-score-filter"
            >
              <option value="all">All scores</option>
              <option value="high">High: 80% and above</option>
              <option value="medium">Medium: 50–79%</option>
              <option value="low">Low: Below 50%</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="performance-empty">
            <LoaderCircle
              size={28}
              className="performance-spin"
            />
            <p>Loading performance data...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="performance-empty">
            <TrendingUp size={35} />
            <strong>
              {error
                ? "Performance data unavailable"
                : "No student performance found"}
            </strong>
            <p>
              {error
                ? "Check the backend endpoint and try refreshing."
                : "Students will appear here when performance data is available."}
            </p>
          </div>
        ) : (
          <div className="performance-table-wrapper">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Test Attempts</th>
                  <th>Average Score</th>
                  <th>Best Score</th>
                  <th>Last Attempt</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className="performance-student-cell">
                        <span className="performance-avatar">
                          {(student.name || student.email || "S")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                        <div>
                          <strong>
                            {student.name || "Unnamed student"}
                          </strong>
                          <span>{student.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{student.totalAttempts || 0}</td>

                    <td>
                      <div className="performance-score-cell">
                        <strong>
                          {formatScore(student.averageScore)}
                        </strong>
                        <div className="performance-score-track">
                          <span
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  Number(student.averageScore || 0)
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="performance-best-score">
                        <Trophy size={15} />
                        {formatScore(student.bestScore)}
                      </span>
                    </td>

                    <td>
                      <span className="performance-date">
                        <CalendarDays size={15} />
                        {formatDate(student.lastAttemptAt)}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="performance-details-button"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedStudent && (
        <div
          className="performance-modal-backdrop"
          onClick={() => setSelectedStudent(null)}
        >
          <section
            className="performance-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="performance-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="performance-modal-header">
              <div>
                <span className="performance-eyebrow">
                  STUDENT PROFILE
                </span>
                <h2 id="performance-modal-title">
                  {selectedStudent.name || "Student"}
                </h2>
              </div>

              <button
                type="button"
                className="performance-modal-close"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <p className="performance-modal-email">
              {selectedStudent.email}
            </p>

            <div className="performance-modal-stats">
              <div>
                <span>Total Attempts</span>
                <strong>
                  {selectedStudent.totalAttempts || 0}
                </strong>
              </div>
              <div>
                <span>Average Score</span>
                <strong>
                  {formatScore(selectedStudent.averageScore)}
                </strong>
              </div>
              <div>
                <span>Best Score</span>
                <strong>
                  {formatScore(selectedStudent.bestScore)}
                </strong>
              </div>
            </div>

            <p className="performance-modal-note">
              Last attempt: {formatDate(selectedStudent.lastAttemptAt)}
            </p>

            <button
              type="button"
              className="performance-modal-done"
              onClick={() => setSelectedStudent(null)}
            >
              Close
            </button>
          </section>
        </div>
      )}
    </div>
  );
};

export default StudentPerformance;
