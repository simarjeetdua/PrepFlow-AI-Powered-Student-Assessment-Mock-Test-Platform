
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserRound,
  GraduationCap,
  Search,
  RefreshCw,
  Trash2,
  ShieldCheck,
  X,
  LoaderCircle,
  Mail,
} from "lucide-react";

import api from "../../services/api";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      // Admin-only endpoint to be implemented in the backend.
      const response = await api.get("/admin/users");
      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load users. Check the admin users API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const matchesSearch =
        (user.name || "").toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const counts = useMemo(
    () => ({
      total: users.length,
      students: users.filter((user) => user.role === "student").length,
      teachers: users.filter((user) => user.role === "teacher").length,
      admins: users.filter((user) => user.role === "admin").length,
    }),
    [users]
  );

  const handleDelete = async (user) => {
    if (user.role === "admin") {
      setError("Admin accounts cannot be deleted from this page.");
      return;
    }

    const confirmed = window.confirm(
      `Delete the account for ${user.name || user.email}? This cannot be undone.`
    );

    if (!confirmed) return;

    setActionId(user._id);
    setError("");
    setMessage("");

    try {
      // Admin-only endpoint to be implemented in the backend.
      const response = await api.delete(`/admin/users/${user._id}`);

      setUsers((previous) =>
        previous.filter((item) => item._id !== user._id)
      );

      setMessage(
        response.data.message || "User account deleted successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete this account."
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="manage-users-page">
      <header className="manage-users-header">
        <div>
          <span className="manage-users-eyebrow">
            USER ADMINISTRATION
          </span>
          <h1>Manage Users</h1>
          <p>
            View registered students and teachers in PrepFlow.
          </p>
        </div>

        <button
          type="button"
          className="manage-users-refresh"
          onClick={loadUsers}
          disabled={loading || actionId !== null}
        >
          <RefreshCw
            size={17}
            className={loading ? "manage-users-spin" : ""}
          />
          Refresh
        </button>
      </header>

      {error && (
        <div className="manage-users-alert error" role="alert">
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
        <div className="manage-users-alert success" role="status">
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

      <section className="manage-users-stats">
        <article className="manage-users-stat-card">
          <span className="manage-users-stat-icon">
            <Users size={22} />
          </span>
          <div>
            <p>Total Accounts</p>
            <strong>{loading ? "—" : counts.total}</strong>
          </div>
        </article>

        <article className="manage-users-stat-card">
          <span className="manage-users-stat-icon students">
            <GraduationCap size={22} />
          </span>
          <div>
            <p>Students</p>
            <strong>{loading ? "—" : counts.students}</strong>
          </div>
        </article>

        <article className="manage-users-stat-card">
          <span className="manage-users-stat-icon teachers">
            <UserRound size={22} />
          </span>
          <div>
            <p>Teachers</p>
            <strong>{loading ? "—" : counts.teachers}</strong>
          </div>
        </article>

        <article className="manage-users-stat-card">
          <span className="manage-users-stat-icon admins">
            <ShieldCheck size={22} />
          </span>
          <div>
            <p>Admins</p>
            <strong>{loading ? "—" : counts.admins}</strong>
          </div>
        </article>
      </section>

      <section className="manage-users-panel">
        <div className="manage-users-list-header">
          <div>
            <h2>Registered Accounts</h2>
            <p>Search users and filter the list by role.</p>
          </div>

          <div className="manage-users-controls">
            <label className="manage-users-search">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email..."
                aria-label="Search users by name or email"
              />
            </label>

            <select
              className="manage-users-role-filter"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter users by role"
            >
              <option value="all">All roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="manage-users-empty">
            <LoaderCircle
              size={28}
              className="manage-users-spin"
            />
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="manage-users-empty">
            <Users size={35} />
            <strong>
              {search || roleFilter !== "all"
                ? "No matching users"
                : "No users found"}
            </strong>
            <p>
              {error
                ? "Resolve the API error and refresh this page."
                : "Try another search or role filter."}
            </p>
          </div>
        ) : (
          <div className="manage-users-table-wrapper">
            <table className="manage-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="manage-users-user-cell">
                        <span className="manage-users-avatar">
                          {(user.name || user.email || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                        <strong>{user.name || "Unnamed user"}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="manage-users-email">
                        <Mail size={15} />
                        {user.email}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`manage-users-role ${user.role}`}
                      >
                        {user.role || "unknown"}
                      </span>
                    </td>

                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      {user.role === "admin" ? (
                        <span className="manage-users-protected">
                          <ShieldCheck size={16} />
                          Protected
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="manage-users-delete"
                          onClick={() => handleDelete(user)}
                          disabled={actionId !== null}
                          title="Delete user"
                          aria-label={`Delete ${user.name || user.email}`}
                        >
                          {actionId === user._id ? (
                            <LoaderCircle
                              size={17}
                              className="manage-users-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}
                          Delete
                        </button>
                      )}
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

export default ManageUsers;
