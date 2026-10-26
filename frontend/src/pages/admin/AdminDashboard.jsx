
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserRound,
  ClipboardList,
  BookOpen,
  TrendingUp,
  RefreshCw,
  FileText,
  Video,
  ArrowRight,
  GraduationCap,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";
import AdminStatCard from "../../components/admin/AdminStatCard";
import "./AdminDashboard.css";

const quickActions = [
  {
    title: "Manage Notes & PDFs",
    description: "Upload and organize learning materials.",
    icon: FileText,
    path: "/admin/notes",
    color: "purple",
  },
  {
    title: "Manage Video Lessons",
    description: "Organize educational video content.",
    icon: Video,
    path: "/admin/videos",
    color: "blue",
  },
  {
    title: "Manage Mock Tests",
    description: "Review and manage available assessments.",
    icon: ClipboardList,
    path: "/admin/tests",
    color: "orange",
  },
  {
    title: "Manage Users",
    description: "View and manage platform accounts.",
    icon: Users,
    path: "/admin/users",
    color: "green",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    tests: 0,
    materials: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/admin/dashboard/stats");
      const data = response.data?.stats;

      if (!response.data?.success || !data) {
        throw new Error("Unable to load dashboard statistics.");
      }

      setStats({
        students: data.students ?? 0,
        teachers: data.teachers ?? 0,
        tests: data.tests ?? 0,
        materials: data.materials ?? 0,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totalAccounts = stats.students + stats.teachers;

  const statCards = [
    {
      title: "Total Students",
      value: stats.students,
      description: "Registered student accounts",
      icon: "students",
      color: "blue",
    },
    {
      title: "Total Teachers",
      value: stats.teachers,
      description: "Teacher accounts",
      icon: "teachers",
      color: "green",
    },
    {
      title: "Mock Tests",
      value: stats.tests,
      description: "Available platform tests",
      icon: "tests",
      color: "purple",
    },
    {
      title: "Learning Materials",
      value: stats.materials,
      description: "Notes and PDFs",
      icon: "materials",
      color: "orange",
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Welcome section */}
      <section className="admin-dashboard-welcome">
        <div className="admin-dashboard-welcome-content">
          <span className="admin-dashboard-eyebrow">
            <GraduationCap size={16} />
            ADMINISTRATION
          </span>

          <h1>Welcome to PrepFlow</h1>

          <p>
            Manage learning resources, assessments, and your students'
            learning experience from one place.
          </p>
        </div>

        <div className="admin-dashboard-welcome-icon">
          <GraduationCap size={66} strokeWidth={1.5} />
        </div>
      </section>

      {/* Statistics heading */}
      <section className="admin-dashboard-section">
        <div className="admin-dashboard-section-header">
          <div>
            <h2>Platform Overview</h2>
            <p>Here's a summary of your learning platform.</p>
          </div>

          <button
            type="button"
            className="admin-dashboard-refresh"
            onClick={() => fetchStats(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "admin-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="admin-dashboard-error" role="alert">
            <AlertCircle size={19} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => fetchStats(true)}
              disabled={refreshing}
            >
              Try again
            </button>
          </div>
        )}

        <div className="admin-dashboard-stats">
          {statCards.map((card) => (
            <div className="admin-dashboard-stat-wrapper" key={card.title}>
              {loading ? (
                <div
                  className="admin-dashboard-stat-skeleton"
                  aria-label={`Loading ${card.title}`}
                >
                  <div />
                  <div />
                  <div />
                </div>
              ) : (
                <AdminStatCard {...card} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="admin-dashboard-section">
        <div className="admin-dashboard-section-header">
          <div>
            <h2>Quick Actions</h2>
            <p>Navigate directly to your management tools.</p>
          </div>
        </div>

        <div className="admin-dashboard-actions">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                type="button"
                className="admin-dashboard-action"
                key={action.path}
                onClick={() => navigate(action.path)}
              >
                <span
                  className={`admin-dashboard-action-icon ${action.color}`}
                >
                  <Icon size={22} />
                </span>

                <span className="admin-dashboard-action-content">
                  <strong>{action.title}</strong>
                  <span>{action.description}</span>
                </span>

                <ArrowRight
                  size={18}
                  className="admin-dashboard-action-arrow"
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Platform summary */}
      <section className="admin-dashboard-bottom-grid">
        <div className="admin-dashboard-summary-card">
          <div className="admin-dashboard-summary-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <h3>Platform Accounts</h3>
            <p>Total registered students and teachers.</p>
            <strong>
              {loading ? "Loading..." : totalAccounts.toLocaleString()}
            </strong>
            <span className="admin-dashboard-summary-caption">
              Student and teacher accounts combined
            </span>
          </div>
        </div>

        <div className="admin-dashboard-summary-card">
          <div className="admin-dashboard-summary-icon materials">
            <BookOpen size={22} />
          </div>

          <div>
            <h3>Learning Resources</h3>
            <p>Published learning content overview.</p>
            <strong>
              {loading ? "Loading..." : stats.materials.toLocaleString()}
            </strong>
            <span className="admin-dashboard-summary-caption">
              Resources reported by the dashboard API
            </span>
          </div>
        </div>
      </section>

      <footer className="admin-dashboard-footer">
        <span>PrepFlow Administration</span>
        <span>Manage your learning platform with confidence.</span>
      </footer>
    </div>
  );
};

export default AdminDashboard;
