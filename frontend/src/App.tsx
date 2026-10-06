import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronDown,
  FileText,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

type DashboardActivity = {
  action: string;
  resource_type: string;
  created_at: string;
};

type DashboardSummary = {
  organization_id: string;
  organization_name: string;
  user_name: string;
  role: string;
  total_users: number;
  active_users: number;
  audit_events: number;
  ai_insights: number;
  system_health: number;
  recent_activity: DashboardActivity[];
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
};

type OrganizationForm = {
  name: string;
  slug: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
};

const TOKEN_KEY = "nexora_access_token";

const getApiErrorMessage = (
  data: unknown,
  fallback: string,
): string => {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const payload = data as {
      detail?: unknown;
      message?: unknown;
    };

    const detail = payload.detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (item && typeof item === "object") {
            const entry = item as { msg?: unknown };
            return typeof entry.msg === "string" ? entry.msg : null;
          }
          return typeof item === "string" ? item : null;
        })
        .filter(Boolean);

      if (messages.length) {
        return messages.join(" • ");
      }
    }

    if (detail && typeof detail === "object") {
      const detailObject = detail as {
        message?: unknown;
        error?: unknown;
      };

      if (
        typeof detailObject.message === "string" &&
        detailObject.message.trim()
      ) {
        return detailObject.message;
      }

      if (
        typeof detailObject.error === "string" &&
        detailObject.error.trim()
      ) {
        return detailObject.error;
      }

      try {
        return JSON.stringify(detail);
      } catch {
        return fallback;
      }
    }

    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
  }

  return fallback;
};



const fallbackInsights = [
  {
    title: "Operational efficiency",
    text: "Current activity indicates stable operational performance across the organization.",
    type: "Performance",
    icon: TrendingUp,
  },
  {
    title: "User activity",
    text: "User activity is being monitored from the organization workspace.",
    type: "Activity",
    icon: Users,
  },
  {
    title: "Recent events",
    text: "Recent operational events are available for administrator review.",
    type: "Attention",
    icon: AlertTriangle,
  },
];

function formatActivityAction(action: string) {
  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function getActivityIcon(action: string) {
  if (action.includes("LOGIN")) {
    return Users;
  }

  if (action.includes("USER")) {
    return Users;
  }

  if (action.includes("AI")) {
    return BrainCircuit;
  }

  if (action.includes("HEALTH")) {
    return CheckCircle2;
  }

  return FileText;
}


type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  organization_id: string;
  created_at: string;
};

type UserForm = {
  email: string;
  full_name: string;
  password: string;
  role: string;
};

function UsersPage({
  token,
  organizationId,
}: {
  token: string;
  organizationId?: string | null;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<UserForm>({
    email: "",
    full_name: "",
    password: "",
    role: "member",
  });

  const loadUsers = async () => {
    setLoadingUsers(true);
    setUserError("");

    try {
      const params = new URLSearchParams();

      if (organizationId) {
        params.set("organization_id", organizationId);
      }

      const query = params.toString();

      const response = await fetch(
        `/api/users${query ? `?${query}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load users.");
      }

      setUsers(data as User[]);
    } catch (err) {
      setUserError(
        err instanceof Error ? err.message : "Unable to load users.",
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [token, organizationId]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.full_name, user.email, user.role].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [users, search]);

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setUserError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: form.email.trim(),
          full_name: form.full_name.trim(),
          password: form.password,
          role: form.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(data, "Unable to create user."),
        );
      }

      setForm({
        email: "",
        full_name: "",
        password: "",
        role: "member",
      });

      setShowCreate(false);
      await loadUsers();
    } catch (err) {
      setUserError(
        err instanceof Error ? err.message : "Unable to create user.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="users-page">
      <div className="page-intro">
        <div>
          <span className="section-kicker">IDENTITY MANAGEMENT</span>
          <h1>Users</h1>
          <p>
            Manage people, roles, and access across your enterprise workspace.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="secondary-action"
            type="button"
            onClick={() => void loadUsers()}
            disabled={loadingUsers}
          >
            <RefreshCw size={16} className={loadingUsers ? "spin" : ""} />
            Refresh
          </button>

          <button
            className="primary-action"
            type="button"
            onClick={() => setShowCreate((value) => !value)}
          >
            <Plus size={17} />
            New user
          </button>
        </div>
      </div>

      {userError && (
        <div className="users-error">
          <AlertTriangle size={17} />
          <span>{userError}</span>
        </div>
      )}

      {showCreate && (
        <div className="create-user-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">ADD MEMBER</span>
              <h2>Create user</h2>
            </div>
          </div>

          <form className="user-form" onSubmit={handleCreateUser}>
            <label className="user-form-field">
              <span>Full name</span>
              <input
                type="text"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="user-form-field">
              <span>Email address</span>
              <input
                type="email"
                placeholder="john@company.com"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="user-form-field">
              <span>Temporary password</span>
              <input
                type="password"
                placeholder="Enter a password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                required
                minLength={8}
              />
            </label>

            <label className="user-form-field">
              <span>Role</span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value,
                  }))
                }
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <div className="user-form-actions">
              <button
                className="secondary-action"
                type="button"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>

              <button
                className="primary-action"
                type="submit"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create user"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-panel">
        <div className="users-panel-header">
          <div>
            <span className="section-kicker">WORKSPACE MEMBERS</span>
            <h2>User directory</h2>
          </div>

          <span className="user-count">
            {users.length} {users.length === 1 ? "user" : "users"}
          </span>
        </div>

        <div className="user-search">
          <Users size={17} />
          <input
            type="search"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loadingUsers ? (
          <div className="empty-user-state">
            <RefreshCw size={22} className="spin" />
            <span>Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-user-state">
            <Users size={26} />
            <strong>
              {users.length === 0 ? "No users found" : "No matching users"}
            </strong>
            <span>
              {users.length === 0
                ? "Create your first workspace user to get started."
                : "Try a different search term."}
            </span>
          </div>
        ) : (
          <div className="user-list">
            {filteredUsers.map((user) => (
              <div className="user-row" key={user.id}>
                <div className="user-avatar">
                  {(user.full_name || user.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="user-main">
                  <strong>{user.full_name || "Unnamed user"}</strong>
                  <span>{user.email}</span>
                </div>

                <div className="user-role">
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </div>

                <div className="user-status">
                  <span
                    className={`status-badge ${
                      user.is_active ? "active" : "inactive"
                    }`}
                  >
                    <span className="status-dot" />
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="user-created">
                  Created{" "}
                  {new Date(user.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function OrganizationsPage({
  token,
}: {
  token: string;
}) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [organizationError, setOrganizationError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<OrganizationForm>({
    name: "",
    slug: "",
  });

  const loadOrganizations = async () => {
    setLoadingOrganizations(true);
    setOrganizationError("");

    try {
      const response = await fetch("/api/organizations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load organizations.",
        );
      }

      setOrganizations(data as Organization[]);
    } catch (err) {
      setOrganizationError(
        err instanceof Error
          ? err.message
          : "Unable to load organizations.",
      );
    } finally {
      setLoadingOrganizations(false);
    }
  };

  useEffect(() => {
    void loadOrganizations();
  }, [token]);

  const handleCreateOrganization = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setCreating(true);
    setOrganizationError("");

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to create organization.",
        );
      }

      setOrganizations((current) => [
        data as Organization,
        ...current,
      ]);

      setForm({
        name: "",
        slug: "",
      });

      setShowCreate(false);
    } catch (err) {
      setOrganizationError(
        err instanceof Error
          ? err.message
          : "Unable to create organization.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="organizations-page">
      <div className="page-intro">
        <div>
          <span className="panel-kicker">WORKSPACE MANAGEMENT</span>
          <h3>Organizations</h3>
          <p>
            Manage enterprise workspaces and organization access.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="secondary-action"
            onClick={() => void loadOrganizations()}
            disabled={loadingOrganizations}
          >
            <RefreshCw
              size={16}
              className={loadingOrganizations ? "spin" : ""}
            />
            Refresh
          </button>

          <button
            className="primary-action"
            onClick={() => setShowCreate((value) => !value)}
          >
            <Plus size={17} />
            New organization
          </button>
        </div>
      </div>

      {showCreate && (
        <section className="panel create-organization-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">CREATE WORKSPACE</span>
              <h4>New organization</h4>
            </div>
          </div>

          <form
            className="organization-form"
            onSubmit={handleCreateOrganization}
          >
            <div className="organization-form-field">
              <label htmlFor="organization-name">
                Organization name
              </label>
              <input
                id="organization-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Acme Corporation"
                required
                minLength={2}
                maxLength={150}
              />
            </div>

            <div className="organization-form-field">
              <label htmlFor="organization-slug">
                Workspace slug
              </label>
              <input
                id="organization-slug"
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slug: event.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-"),
                  }))
                }
                placeholder="acme-corporation"
                required
                maxLength={180}
              />
            </div>

            <div className="organization-form-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-action"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create organization"}
              </button>
            </div>
          </form>
        </section>
      )}

      {organizationError && (
        <div className="error-message dashboard-error">
          {organizationError}
        </div>
      )}

      {loadingOrganizations ? (
        <div className="loading-state">
          Loading organizations...
        </div>
      ) : (
        <section className="panel organizations-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">ENTERPRISE WORKSPACES</span>
              <h4>Organization directory</h4>
            </div>

            <span className="organization-count">
              {organizations.length}{" "}
              {organizations.length === 1
                ? "organization"
                : "organizations"}
            </span>
          </div>

          {organizations.length === 0 ? (
            <div className="empty-organization-state">
              <div className="empty-organization-icon">
                <Building2 size={25} />
              </div>

              <strong>No organizations found</strong>

              <span>
                Create your first enterprise workspace to get started.
              </span>
            </div>
          ) : (
            <div className="organization-list">
              {organizations.map((organization) => (
                <div
                  className="organization-row"
                  key={organization.id}
                >
                  <div className="organization-main">
                    <div className="organization-icon">
                      <Building2 size={19} />
                    </div>

                    <div>
                      <strong>{organization.name}</strong>
                      <span>
                        /{organization.slug}
                      </span>
                    </div>
                  </div>

                  <div className="organization-meta">
                    <span
                      className={
                        organization.is_active
                          ? "status-badge active"
                          : "status-badge inactive"
                      }
                    >
                      <span />
                      {organization.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <time>
                      Created{" "}
                      {new Date(
                        organization.created_at,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}



type AuditLog = {
  id: string;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  actor_user_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
};

function AuditLogsPage({
  token,
  organizationId,
}: {
  token: string | null;
  organizationId?: string | null;
}) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadAuditLogs = async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (organizationId) {
        params.set("organization_id", organizationId);
      }

      const query = params.toString();

      const response = await fetch(
        `/api/audit-logs${query ? `?${query}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Unable to load audit logs.");
      }

      const data = await response.json();

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.logs)
            ? data.logs
            : [];

      setLogs(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load audit logs.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAuditLogs();
  }, [token, organizationId]);

  const filteredLogs = logs.filter((log) => {
    const query = search.toLowerCase();

    return (
      log.action.toLowerCase().includes(query) ||
      (log.entity_type ?? "").toLowerCase().includes(query) ||
      (log.actor_user_id ?? "").toLowerCase().includes(query)
    );
  });

  const formatAction = (action: string) =>
    action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <section className="audit-page">
      <div className="page-intro audit-page-header">
        <div>
          <span className="eyebrow">
            <span className="live-dot" />
            SECURITY & GOVERNANCE
          </span>

          <h3>Audit Logs</h3>

          <p>
            Track important workspace activity, access events, and
            administrative actions.
          </p>
        </div>

        <button
          className="secondary-action"
          onClick={() => void loadAuditLogs()}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="audit-summary-grid">
        <div className="audit-summary-card">
          <div className="audit-summary-icon">
            <FileText size={20} />
          </div>

          <div>
            <span>TOTAL EVENTS</span>
            <strong>{logs.length}</strong>
            <p>Recorded audit events</p>
          </div>
        </div>

        <div className="audit-summary-card">
          <div className="audit-summary-icon">
            <Activity size={20} />
          </div>

          <div>
            <span>RECENT ACTIVITY</span>
            <strong>{filteredLogs.length}</strong>
            <p>Events matching current view</p>
          </div>
        </div>

        <div className="audit-summary-card">
          <div className="audit-summary-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>GOVERNANCE</span>
            <strong>Active</strong>
            <p>Audit monitoring enabled</p>
          </div>
        </div>
      </div>

      <section className="audit-panel">
        <div className="audit-panel-header">
          <div>
            <span className="panel-eyebrow">ACTIVITY HISTORY</span>
            <h4>Workspace activity</h4>
          </div>

          <span className="audit-count">
            {logs.length} {logs.length === 1 ? "event" : "events"}
          </span>
        </div>

        <div className="audit-search">
          <FileText size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search actions, entities, or users..."
          />
        </div>

        {loading ? (
          <div className="audit-empty-state">
            <RefreshCw size={24} className="spin" />
            <strong>Loading audit activity...</strong>
            <span>Fetching the latest workspace events.</span>
          </div>
        ) : error ? (
          <div className="audit-empty-state audit-error-state">
            <AlertTriangle size={24} />
            <strong>Unable to load audit logs</strong>
            <span>{error}</span>

            <button
              className="primary-action"
              onClick={() => void loadAuditLogs()}
            >
              Try again
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="audit-empty-state">
            <FileText size={24} />
            <strong>
              {logs.length === 0
                ? "No audit events found"
                : "No matching events"}
            </strong>

            <span>
              {logs.length === 0
                ? "Workspace activity will appear here as actions are recorded."
                : "Try a different search term."}
            </span>
          </div>
        ) : (
          <div className="audit-list">
            {filteredLogs.map((log) => (
              <div className="audit-row" key={log.id}>
                <div className="audit-event-icon">
                  <Activity size={17} />
                </div>

                <div className="audit-event-main">
                  <strong>{formatAction(log.action)}</strong>

                  <span>
                    {log.entity_type
                      ? `${log.entity_type.replace(/_/g, " ")}`
                      : "System activity"}
                  </span>
                </div>

                <div className="audit-event-meta">
                  {log.entity_id && (
                    <span className="audit-entity">
                      {log.entity_id.slice(0, 8)}
                    </span>
                  )}

                  <time>{formatDate(log.created_at)}</time>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

type AIInsight = {
  type: string;
  title: string;
  description: string;
  value: string;
  label: string;
};

function AIInsightsPage({
  dashboard,
  token,
}: {
  dashboard: DashboardSummary | null;
  token: string | null;
}) {
  const totalUsers = dashboard?.total_users ?? 0;
  const activeUsers = dashboard?.active_users ?? 0;
  const auditEvents = dashboard?.audit_events ?? 0;
  const systemHealth = dashboard?.system_health ?? 99.8;

  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState("");

  useEffect(() => {
    if (!token || !dashboard?.organization_id) {
      setInsights([]);
      setInsightsLoading(false);
      return;
    }

    let cancelled = false;

    const loadInsights = async () => {
      setInsightsLoading(true);
      setInsightsError("");

      try {
        const response = await fetch(
          `/api/insights?organization_id=${encodeURIComponent(
            dashboard.organization_id,
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load AI insights.");
        }

        const data: { insights: AIInsight[] } = await response.json();

        if (!cancelled) {
          setInsights(data.insights ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setInsights([]);
          setInsightsError(
            error instanceof Error
              ? error.message
              : "Unable to load AI insights.",
          );
        }
      } finally {
        if (!cancelled) {
          setInsightsLoading(false);
        }
      }
    };

    void loadInsights();

    return () => {
      cancelled = true;
    };
  }, [token, dashboard?.organization_id]);

  const insightIcons = [TrendingUp, Users, Activity, BrainCircuit];

  const recommendations = [
    {
      icon: Activity,
      title: "Monitor workspace activity",
      text: "Continue reviewing operational events to identify unusual changes or emerging patterns.",
    },
    {
      icon: Users,
      title: "Review inactive members",
      text: "Keep user access aligned with current workspace participation and responsibilities.",
    },
    {
      icon: ShieldCheck,
      title: "Maintain access governance",
      text: "Regularly review administrator and member permissions as the organization grows.",
    },
  ];

  return (
    <section className="ai-insights-page">
      <div className="page-intro ai-insights-header">
        <div>
          <span className="eyebrow">
            <span className="live-dot" />
            INTELLIGENCE CENTER
          </span>

          <h3>AI Insights</h3>

          <p>
            Turn workspace activity into actionable enterprise intelligence.
          </p>
        </div>

        <div className="ai-status-pill">
          <span className="status-dot" />
          Intelligence active
        </div>
      </div>

      <div className="ai-overview-grid">
        <div className="ai-overview-card">
          <div className="ai-overview-icon">
            <BrainCircuit size={20} />
          </div>

          <div>
            <span>AI ENGINE</span>
            <strong>Operational</strong>
            <p>Analyzing workspace signals</p>
          </div>
        </div>

        <div className="ai-overview-card">
          <div className="ai-overview-icon">
            <Activity size={20} />
          </div>

          <div>
            <span>DATA SIGNALS</span>
            <strong>{auditEvents}</strong>
            <p>Recent operational events</p>
          </div>
        </div>

        <div className="ai-overview-card">
          <div className="ai-overview-icon">
            <Users size={20} />
          </div>

          <div>
            <span>ACTIVE USERS</span>
            <strong>{activeUsers}</strong>
            <p>of {totalUsers} workspace members</p>
          </div>
        </div>

        <div className="ai-overview-card">
          <div className="ai-overview-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>SYSTEM HEALTH</span>
            <strong>{systemHealth}%</strong>
            <p>Current platform health</p>
          </div>
        </div>
      </div>

      <div className="ai-content-grid">
        <div className="ai-insights-panel">
          <div className="ai-panel-header">
            <div>
              <span className="panel-eyebrow">GENERATED INSIGHTS</span>
              <h4>What Nexora sees</h4>
            </div>

            <span className="ai-live-badge">
              <Zap size={13} />
              Live
            </span>
          </div>

          <div className="ai-insight-list">
            {insightsLoading ? (
              <div className="ai-insight-card">
                <div className="ai-insight-icon">
                  <BrainCircuit size={20} />
                </div>

                <div className="ai-insight-body">
                  <div className="ai-insight-topline">
                    <span>ANALYZING</span>
                    <strong>—</strong>
                  </div>

                  <h5>Analyzing workspace signals...</h5>

                  <p>
                    Nexora is analyzing recent workspace activity and
                    operational patterns.
                  </p>

                  <small>processing</small>
                </div>
              </div>
            ) : insightsError ? (
              <div className="ai-insight-card">
                <div className="ai-insight-icon">
                  <BrainCircuit size={20} />
                </div>

                <div className="ai-insight-body">
                  <div className="ai-insight-topline">
                    <span>ERROR</span>
                    <strong>!</strong>
                  </div>

                  <h5>AI insights unavailable</h5>

                  <p>{insightsError}</p>

                  <small>service error</small>
                </div>
              </div>
            ) : insights.length === 0 ? (
              <div className="ai-insight-card">
                <div className="ai-insight-icon">
                  <BrainCircuit size={20} />
                </div>

                <div className="ai-insight-body">
                  <div className="ai-insight-topline">
                    <span>INTELLIGENCE</span>
                    <strong>—</strong>
                  </div>

                  <h5>No insights available yet</h5>

                  <p>
                    Nexora needs more workspace activity before it can surface
                    meaningful operational patterns.
                  </p>

                  <small>awaiting signals</small>
                </div>
              </div>
            ) : (
              insights.map((insight, index) => {
                const Icon = insightIcons[index] ?? BrainCircuit;

                return (
                  <div
                    className="ai-insight-card"
                    key={`${insight.type}-${insight.title}`}
                  >
                    <div className="ai-insight-icon">
                      <Icon size={20} />
                    </div>

                    <div className="ai-insight-body">
                      <div className="ai-insight-topline">
                        <span>{insight.type}</span>

                        <strong>{insight.value}</strong>
                      </div>

                      <h5>{insight.title}</h5>

                      <p>{insight.description}</p>

                      <small>{insight.label}</small>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="ai-recommendations-panel">
          <div className="ai-panel-header">
            <div>
              <span className="panel-eyebrow">RECOMMENDATIONS</span>
              <h4>Next best actions</h4>
            </div>
          </div>

          <div className="ai-recommendation-list">
            {recommendations.map((recommendation) => {
              const Icon = recommendation.icon;

              return (
                <div
                  className="ai-recommendation"
                  key={recommendation.title}
                >
                  <div className="recommendation-icon">
                    <Icon size={18} />
                  </div>

                  <div>
                    <h5>{recommendation.title}</h5>
                    <p>{recommendation.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ai-confidence">
            <div className="confidence-header">
              <span>AI confidence</span>
              <strong>High</strong>
            </div>

            <div className="confidence-track">
              <div className="confidence-fill" />
            </div>

            <p>
              Confidence is based on currently available workspace activity
              signals.
            </p>
          </div>
        </div>
      </div>

      <div className="ai-footer-card">
        <div className="ai-footer-icon">
          <BrainCircuit size={22} />
        </div>

        <div>
          <span className="panel-eyebrow">NEXORA INTELLIGENCE</span>
          <h4>More intelligence as your workspace grows</h4>
          <p>
            Nexora continuously builds context from operational activity,
            access patterns, and workspace signals to help teams make faster,
            more informed decisions.
          </p>
        </div>
      </div>
    </section>
  );
}

function AnalyticsPage({
  dashboard,
  token,
}: {
  dashboard: DashboardSummary | null;
  token: string | null;
}) {
  const totalUsers = dashboard?.total_users ?? 0;
  const activeUsers = dashboard?.active_users ?? 0;
  const auditEvents = dashboard?.audit_events ?? 0;
  const systemHealth = dashboard?.system_health ?? 99.8;

  const activeRate =
    totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const [activityData, setActivityData] = useState<
    { date: string; count: number }[]
  >([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    if (!token || !dashboard?.organization_id) {
      setActivityData([]);
      setActivityLoading(false);
      return;
    }

    const loadActivity = async () => {
      setActivityLoading(true);

      try {
        const params = new URLSearchParams({
          organization_id: dashboard.organization_id,
          days: "30",
        });

        const response = await fetch(
          `/api/analytics/activity?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load analytics activity.");
        }

        const data = await response.json();

        setActivityData(
          Array.isArray(data.points)
            ? data.points.map(
                (point: { date: string; count: number }) => ({
                  date: point.date,
                  count: point.count,
                }),
              )
            : [],
        );
      } catch {
        setActivityData([]);
      } finally {
        setActivityLoading(false);
      }
    };

    void loadActivity();
  }, [token, dashboard?.organization_id]);

  const maxActivity = Math.max(
    ...activityData.map((point) => point.count),
    1,
  );

  const chartStep = Math.max(1, Math.ceil(maxActivity / 4));
  const chartMax = chartStep * 4;

  const analyticsCards = [
    {
      icon: Users,
      label: "WORKSPACE USERS",
      value: totalUsers,
      detail: `${activeUsers} currently active`,
    },
    {
      icon: Activity,
      label: "AUDIT EVENTS",
      value: auditEvents,
      detail: "Recorded workspace events",
    },
    {
      icon: TrendingUp,
      label: "ACTIVE RATE",
      value: `${activeRate}%`,
      detail: "Current member activity",
    },
    {
      icon: ShieldCheck,
      label: "SYSTEM HEALTH",
      value: `${systemHealth}%`,
      detail: "Platform reliability",
    },
  ];

  const operationalMetrics = [
    {
      label: "User adoption",
      value: activeRate,
      suffix: "%",
      description: "Active members across the workspace",
    },
    {
      label: "Operational activity",
      value: Math.min(auditEvents * 8, 100),
      suffix: "%",
      description: "Workspace activity signal",
    },
    {
      label: "Platform reliability",
      value: systemHealth,
      suffix: "%",
      description: "Current infrastructure health",
    },
  ];

  return (
    <section className="analytics-page">
      <div className="page-intro analytics-header">
        <div>
          <span className="eyebrow">
            <span className="live-dot" />
            BUSINESS ANALYTICS
          </span>

          <h3>Analytics</h3>

          <p>
            Understand workspace performance, activity, and operational trends.
          </p>
        </div>

        <button className="date-button">
          Last 30 days
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="analytics-summary-grid">
        {analyticsCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="analytics-summary-card" key={card.label}>
              <div className="analytics-summary-top">
                <div className="analytics-summary-icon">
                  <Icon size={19} />
                </div>

                <span className="analytics-live">Live</span>
              </div>

              <span className="analytics-card-label">{card.label}</span>

              <strong>{card.value}</strong>

              <p>{card.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="analytics-main-grid">
        <section className="analytics-panel analytics-chart-panel">
          <div className="analytics-panel-header">
            <div>
              <span className="panel-eyebrow">ACTIVITY TREND</span>
              <h4>Operational activity</h4>
              <p>Workspace activity over the selected period.</p>
            </div>

            <span className="analytics-period">30 DAYS</span>
          </div>

          <div className="analytics-chart">
            <div className="analytics-y-axis">
              {[4, 3, 2, 1, 0].map((step) => (
                <span key={step}>{chartStep * step}</span>
              ))}
            </div>

            <div className="analytics-chart-area">
              <div className="analytics-grid-lines">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="analytics-bars">
                {activityLoading ? (
                  <div className="analytics-empty-state">
                    Loading activity...
                  </div>
                ) : activityData.length > 0 ? (
                  activityData.map((point) => (
                    <div
                      className="analytics-bar-column"
                      key={point.date}
                    >
                      <div
                        className="analytics-bar"
                        style={{
                          height: `${(point.count / chartMax) * 100}%`,
                        }}
                        title={`${new Date(`${point.date}T00:00:00`).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          },
                        )}: ${point.count} audit event${
                          point.count === 1 ? "" : "s"
                        }`}
                      />
                    </div>
                  ))
                ) : (
                  <div className="analytics-empty-state">
                    No activity recorded in the last 30 days.
                  </div>
                )}
              </div>

              <div className="analytics-x-axis">
                {activityData.length > 0 &&
                  [0, 6, 12, 18, 24, 29].map((index) => {
                    const point = activityData[index];

                    if (!point) {
                      return <span key={index}>—</span>;
                    }

                    const label = new Date(
                      `${point.date}T00:00:00`,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                    });

                    return <span key={point.date}>{label}</span>;
                  })}
              </div>
            </div>
          </div>
        </section>

        <section className="analytics-panel analytics-performance-panel">
          <div className="analytics-panel-header">
            <div>
              <span className="panel-eyebrow">PERFORMANCE</span>
              <h4>Workspace health</h4>
            </div>

            <ShieldCheck size={20} />
          </div>

          <div className="analytics-health-score">
            <strong>{systemHealth}%</strong>
            <span>Healthy</span>
          </div>

          <div className="analytics-health-track">
            <div
              className="analytics-health-fill"
              style={{ width: `${Math.min(systemHealth, 100)}%` }}
            />
          </div>

          <p className="analytics-health-description">
            Your Nexora workspace is operating within a healthy range.
          </p>

          <div className="analytics-status-list">
            <div>
              <span>
                <span className="status-dot" />
                API services
              </span>
              <strong>Operational</strong>
            </div>

            <div>
              <span>
                <span className="status-dot" />
                Database
              </span>
              <strong>Operational</strong>
            </div>

            <div>
              <span>
                <span className="status-dot" />
                Intelligence
              </span>
              <strong>Active</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="analytics-panel analytics-metrics-panel">
        <div className="analytics-panel-header">
          <div>
            <span className="panel-eyebrow">KEY INDICATORS</span>
            <h4>Operational metrics</h4>
            <p>Current workspace performance indicators.</p>
          </div>
        </div>

        <div className="analytics-indicator-grid">
          {operationalMetrics.map((metric) => (
            <div className="analytics-indicator" key={metric.label}>
              <div className="analytics-indicator-heading">
                <span>{metric.label}</span>
                <strong>
                  {metric.value}
                  {metric.suffix}
                </strong>
              </div>

              <div className="analytics-indicator-track">
                <div
                  style={{
                    width: `${Math.min(metric.value, 100)}%`,
                  }}
                />
              </div>

              <p>{metric.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="analytics-insight-banner">
        <div className="analytics-insight-icon">
          <BrainCircuit size={22} />
        </div>

        <div>
          <span className="panel-eyebrow">NEXORA INTELLIGENCE</span>
          <h4>Analytics become smarter as your workspace grows</h4>
          <p>
            Nexora combines user activity, audit events, and system signals to
            help identify operational patterns and opportunities.
          </p>
        </div>

        <span className="ai-status-pill">
          <span className="status-dot" />
          Intelligence active
        </span>
      </div>
    </section>
  );
}


function SettingsPage({
  dashboard,
  onLogout,
}: {
  dashboard: DashboardSummary | null;
  onLogout: () => void;
}) {
  const settingsStorageKey = `nexora.settings.${
    dashboard?.organization_id ?? "default"
  }`;

  type SettingsPreferences = {
    notifications: boolean;
    activityAlerts: boolean;
    securityAlerts: boolean;
  };

  const defaultPreferences: SettingsPreferences = {
    notifications: true,
    activityAlerts: true,
    securityAlerts: true,
  };

  const [notifications, setNotifications] = useState(
    defaultPreferences.notifications,
  );
  const [activityAlerts, setActivityAlerts] = useState(
    defaultPreferences.activityAlerts,
  );
  const [securityAlerts, setSecurityAlerts] = useState(
    defaultPreferences.securityAlerts,
  );
  const [savedPreferences, setSavedPreferences] =
    useState<SettingsPreferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(settingsStorageKey);

      if (!stored) {
        setNotifications(defaultPreferences.notifications);
        setActivityAlerts(defaultPreferences.activityAlerts);
        setSecurityAlerts(defaultPreferences.securityAlerts);
        setSavedPreferences(defaultPreferences);
        setSaved(false);
        return;
      }

      const preferences = JSON.parse(stored) as Partial<SettingsPreferences>;

      const loadedPreferences: SettingsPreferences = {
        notifications: preferences.notifications ?? true,
        activityAlerts: preferences.activityAlerts ?? true,
        securityAlerts: preferences.securityAlerts ?? true,
      };

      setNotifications(loadedPreferences.notifications);
      setActivityAlerts(loadedPreferences.activityAlerts);
      setSecurityAlerts(loadedPreferences.securityAlerts);
      setSavedPreferences(loadedPreferences);
      setSaved(false);
    } catch {
      setNotifications(defaultPreferences.notifications);
      setActivityAlerts(defaultPreferences.activityAlerts);
      setSecurityAlerts(defaultPreferences.securityAlerts);
      setSavedPreferences(defaultPreferences);
      setSaved(false);
    }
  }, [settingsStorageKey]);

  const hasUnsavedChanges =
    notifications !== savedPreferences.notifications ||
    activityAlerts !== savedPreferences.activityAlerts ||
    securityAlerts !== savedPreferences.securityAlerts;

  const handleSave = () => {
    const preferences: SettingsPreferences = {
      notifications,
      activityAlerts,
      securityAlerts,
    };

    window.localStorage.setItem(
      settingsStorageKey,
      JSON.stringify(preferences),
    );

    setSavedPreferences(preferences);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section className="settings-page">
      <div className="settings-hero">
        <div>
          <span className="panel-eyebrow">WORKSPACE CONFIGURATION</span>
          <h3>Settings</h3>
          <p>
            Manage your Nexora workspace, preferences, notifications, and
            security controls.
          </p>
        </div>

        <div className="settings-status">
          <span className="status-pulse" />
          Workspace active
        </div>
      </div>

      {saved && (
        <div className="settings-success">
          <CheckCircle2 size={17} />
          Settings saved successfully.
        </div>
      )}

      <div className="settings-grid">
        <div className="settings-main">
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Building2 size={20} />
              </div>
              <div>
                <span className="panel-eyebrow">WORKSPACE</span>
                <h4>Workspace information</h4>
              </div>
            </div>

            <div className="settings-fields">
              <div className="settings-field">
                <label>Workspace name</label>
                <div className="settings-value">
                  {dashboard?.organization_name || "Acme Corporation"}
                </div>
              </div>

              <div className="settings-field">
                <label>Workspace status</label>
                <div className="settings-value settings-value-status">
                  <span className="status-dot" />
                  Active
                </div>
              </div>

              <div className="settings-field">
                <label>Platform</label>
                <div className="settings-value">Nexora Enterprise Intelligence</div>
              </div>

              <div className="settings-field">
                <label>System health</label>
                <div className="settings-value">99.8%</div>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Bell size={20} />
              </div>
              <div>
                <span className="panel-eyebrow">NOTIFICATIONS</span>
                <h4>Notification preferences</h4>
              </div>
            </div>

            <div className="settings-options">
              <div className="settings-option">
                <div>
                  <strong>Workspace notifications</strong>
                  <p>Receive important workspace activity updates.</p>
                </div>

                <button
                  type="button"
                  className={`toggle ${notifications ? "on" : ""}`}
                  onClick={() => setNotifications((value) => !value)}
                  aria-label="Toggle workspace notifications"
                >
                  <span />
                </button>
              </div>

              <div className="settings-option">
                <div>
                  <strong>Activity alerts</strong>
                  <p>Get notified when important operational activity occurs.</p>
                </div>

                <button
                  type="button"
                  className={`toggle ${activityAlerts ? "on" : ""}`}
                  onClick={() => setActivityAlerts((value) => !value)}
                  aria-label="Toggle activity alerts"
                >
                  <span />
                </button>
              </div>

              <div className="settings-option">
                <div>
                  <strong>Security alerts</strong>
                  <p>Receive alerts for access and governance events.</p>
                </div>

                <button
                  type="button"
                  className={`toggle ${securityAlerts ? "on" : ""}`}
                  onClick={() => setSecurityAlerts((value) => !value)}
                  aria-label="Toggle security alerts"
                >
                  <span />
                </button>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="panel-eyebrow">SECURITY</span>
                <h4>Security & access</h4>
              </div>
            </div>

            <div className="security-status-row">
              <div className="security-status-icon">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <strong>Enterprise security is active</strong>
                <p>
                  Authentication, role-based access, and audit monitoring are
                  enabled for this workspace.
                </p>
              </div>

              <span className="security-badge">Protected</span>
            </div>
          </section>
        </div>

        <aside className="settings-side">
          <section className="settings-card account-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Users size={20} />
              </div>
              <div>
                <span className="panel-eyebrow">ACCOUNT</span>
                <h4>Your account</h4>
              </div>
            </div>

            <div className="account-avatar">
              {dashboard?.user_name?.slice(0, 2).toUpperCase() || "SP"}
            </div>

            <h5>{dashboard?.user_name || "Workspace Administrator"}</h5>
            <p>
              {dashboard?.role?.toLowerCase() === "admin"
                ? "Administrator account"
                : "Member account"}
            </p>

            <div className="account-role">
              <ShieldCheck size={15} />
              {dashboard?.role?.toLowerCase() === "admin"
                ? "Administrator"
                : "Member"}
            </div>
          </section>

          <section className="settings-card danger-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <LogOut size={20} />
              </div>
              <div>
                <span className="panel-eyebrow">SESSION</span>
                <h4>Sign out</h4>
              </div>
            </div>

            <p>
              Sign out of your current Nexora workspace session.
            </p>

            <button
              type="button"
              className="logout-settings-button"
              onClick={onLogout}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </section>
        </aside>
      </div>

      <div className="settings-actions">
        <span>
          {hasUnsavedChanges
            ? "You have unsaved changes."
            : "All preferences are saved."}
        </span>

        <button
          type="button"
          className="primary-action"
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
        >
          <CheckCircle2 size={16} />
          {hasUnsavedChanges ? "Save preferences" : "Preferences saved"}
        </button>
      </div>
    </section>
  );
}

function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );

  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [workspaceOrganizations, setWorkspaceOrganizations] = useState<Organization[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);

  const isAdmin = dashboard?.role?.toLowerCase() === "admin";

  useEffect(() => {
    if (!token || !isAdmin) {
      setWorkspaceOrganizations([]);
      return;
    }

    const loadWorkspaceOrganizations = async () => {
      try {
        const response = await fetch("/api/organizations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setWorkspaceOrganizations(data as Organization[]);
      } catch {
        setWorkspaceOrganizations([]);
      }
    };

    void loadWorkspaceOrganizations();
  }, [token, isAdmin]);

  useEffect(() => {
    if (dashboard?.organization_id) {
      setSelectedWorkspaceId(dashboard.organization_id);
    }
  }, [dashboard?.organization_id]);

  const selectedWorkspace =
    workspaceOrganizations.find(
      (organization) => organization.id === selectedWorkspaceId,
    ) ??
    workspaceOrganizations.find(
      (organization) => organization.id === dashboard?.organization_id,
    );

  const navigation = [
    { label: "Dashboard", icon: LayoutDashboard },
    ...(isAdmin
      ? [
          { label: "Organizations", icon: Building2 },
          { label: "Users", icon: Users },
        ]
      : []),
    { label: "AI Insights", icon: BrainCircuit },
    ...(isAdmin ? [{ label: "Audit Logs", icon: FileText }] : []),
    { label: "Analytics", icon: BarChart3 },
    { label: "Settings", icon: Settings },
  ];

  const loadDashboard = async (
    accessToken: string,
    organizationId?: string | null,
  ) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (organizationId) {
        params.set("organization_id", organizationId);
      }

      const query = params.toString();
      const response = await fetch(
        `/api/dashboard/summary${query ? `?${query}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setDashboard(null);
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const data: DashboardSummary = await response.json();
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the Nexora backend.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      void loadDashboard(token, selectedWorkspaceId);
    } else {
      setLoading(false);
    }
  }, [token, selectedWorkspaceId]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid email or password.");
      }

      const loginData = data as LoginResponse;

      localStorage.setItem(TOKEN_KEY, loginData.access_token);
      setToken(loginData.access_token);
      setPassword("");
    } catch (err) {
      setLoginError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the Nexora backend.",
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setDashboard(null);
    setEmail("");
    setPassword("");
    setLoginError("");
    setError("");
  };

  const metrics = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [
      {
        label: "Total Users",
        value: String(dashboard.total_users),
        change: "Live",
        icon: Users,
      },
      {
        label: "Active Users",
        value: String(dashboard.active_users),
        change: "Live",
        icon: Activity,
      },
      {
        label: "AI Insights",
        value: String(dashboard.ai_insights),
        change: "Live",
        icon: BrainCircuit,
      },
      {
        label: "System Health",
        value: `${dashboard.system_health}%`,
        change: "Live",
        icon: ShieldCheck,
      },
    ];
  }, [dashboard]);

  const activities = dashboard?.recent_activity ?? [];

  if (!token) {
    return (
      <div className="login-page">
        <section className="login-showcase">
          <div className="showcase-inner">
            <div className="showcase-brand">
              <div className="login-logo-mark">
                <Zap size={21} strokeWidth={2.5} />
              </div>
              <div>
                <strong>Nexora</strong>
                <span>Enterprise Intelligence</span>
              </div>
            </div>

            <div className="showcase-content">
              <span className="showcase-eyebrow">
                <span className="status-pulse" />
                INTELLIGENCE FOR MODERN ENTERPRISES
              </span>

              <h2>Turn operations into intelligence.</h2>

              <p>
                A secure workspace for understanding activity, monitoring
                operations, and making better decisions with real-time data.
              </p>

              <div className="showcase-features">
                <div className="showcase-feature">
                  <div className="feature-icon">
                    <Activity size={18} />
                  </div>
                  <div>
                    <strong>Real-time operations</strong>
                    <span>Monitor activity across your organization.</span>
                  </div>
                </div>

                <div className="showcase-feature">
                  <div className="feature-icon">
                    <BrainCircuit size={18} />
                  </div>
                  <div>
                    <strong>AI-powered insights</strong>
                    <span>Surface patterns and signals from your data.</span>
                  </div>
                </div>

                <div className="showcase-feature">
                  <div className="feature-icon">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <strong>Enterprise security</strong>
                    <span>Secure access built around your organization.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="login-footer">
              <span>© 2026 Nexora</span>
              <span>Enterprise Intelligence Platform</span>
            </div>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-panel-inner">
            <div className="mobile-login-brand">
              <div className="login-logo-mark">
                <Zap size={21} strokeWidth={2.5} />
              </div>

              <div>
                <strong>Nexora</strong>
                <span>Enterprise Intelligence</span>
              </div>
            </div>

            <div className="professional-login-card">
              <div className="login-card-top">
                <div className="login-card-icon">
                  <LockKeyhole size={19} />
                </div>

                <div className="login-secure-label">
                  <span className="status-pulse" />
                  SECURE ACCESS
                </div>
              </div>

              <div className="login-heading">
                <h2>Welcome to Nexora</h2>
                <p>Sign in to your Nexora workspace to continue.</p>
              </div>

              <form
                onSubmit={handleLogin}
                className="professional-login-form"
              >
                <div className="field-group">
                  <label htmlFor="login-email">Email address</label>

                  <div className="input-wrapper">
                    <Mail size={17} />

                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="field-group">
                  <div className="password-label-row">
                    <label htmlFor="login-password">Password</label>

                    <button
                      type="button"
                      className="forgot-password"
                      onClick={() =>
                        setLoginError(
                          "Password recovery is not configured yet.",
                        )
                      }
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="input-wrapper">
                    <LockKeyhole size={17} />

                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="login-error">
                    <AlertTriangle size={16} />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="professional-login-submit"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <span className="login-spinner" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to Nexora
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="login-security-note">
                <ShieldCheck size={15} />
                <span>Protected enterprise access</span>
              </div>
            </div>

            <p className="login-panel-footer">
              Authorized users only · Nexora Enterprise Platform
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Zap size={21} />
          </div>

          <div>
            <h1>Nexora</h1>
            <span>Enterprise Intelligence</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-selector">
          <button
            type="button"
            className={`workspace ${workspaceOpen ? "workspace-open" : ""}`}
            onClick={() => setWorkspaceOpen((current) => !current)}
            aria-expanded={workspaceOpen}
            aria-haspopup="listbox"
          >
            <div className="workspace-icon">
              <Building2 size={17} />
            </div>

            <div className="workspace-text">
              <strong>
                {selectedWorkspace?.name ??
                  dashboard?.organization_name ??
                  "My Organization"}
              </strong>
              <span>Enterprise Workspace</span>
            </div>

            <ChevronDown
              size={16}
              className={`workspace-chevron ${
                workspaceOpen ? "workspace-chevron-open" : ""
              }`}
            />
          </button>

          {workspaceOpen && (
            <div className="workspace-dropdown" role="listbox">
              {isAdmin && workspaceOrganizations.length > 0 ? (
                workspaceOrganizations.map((organization) => (
                  <button
                    type="button"
                    key={organization.id}
                    className={`workspace-option ${
                      organization.id === selectedWorkspaceId ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedWorkspaceId(organization.id);
                      setWorkspaceOpen(false);
                    }}
                    role="option"
                    aria-selected={organization.id === selectedWorkspaceId}
                  >
                    <div className="workspace-option-icon">
                      <Building2 size={15} />
                    </div>

                    <div className="workspace-option-text">
                      <strong>{organization.name}</strong>
                      <span>/{organization.slug}</span>
                    </div>

                    {organization.id === selectedWorkspaceId && (
                      <span className="workspace-option-check">✓</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="workspace-empty">
                  <span>
                    {dashboard?.organization_name ?? "Current workspace"}
                  </span>
                  <small>Current workspace</small>
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="navigation">
          <span className="nav-title">MAIN MENU</span>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`nav-item ${
                  active === item.label ? "active" : ""
                }`}
                onClick={() => {
                  setActive(item.label);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />

            <div>
              <strong>All systems operational</strong>
              <span>Backend connected</span>
            </div>
          </div>

          <div className="profile-menu-wrapper">
            <button
              className={`profile-button ${profileOpen ? "open" : ""}`}
              onClick={() => setProfileOpen((current) => !current)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <div className="avatar">SP</div>

              <div className="profile-info">
                <strong>{dashboard?.user_name ?? "User"}</strong>
                <span>
                  {dashboard?.role?.toLowerCase() === "admin"
                    ? "Administrator"
                    : "Member"}
                </span>
              </div>

              <ChevronDown
                size={15}
                className={`profile-chevron ${profileOpen ? "rotated" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="profile-dropdown" role="menu">
                <div className="profile-dropdown-header">
                  <div className="avatar profile-dropdown-avatar">SP</div>

                  <div>
                    <strong>{dashboard?.user_name ?? "User"}</strong>
                    <span>
                      {dashboard?.role?.toLowerCase() === "admin"
                        ? "Administrator"
                        : "Member"}
                    </span>
                  </div>
                </div>

                <div className="profile-dropdown-divider" />

                <button
                  className="profile-dropdown-item"
                  onClick={() => {
                    setActive("Settings");
                    setProfileOpen(false);
                  }}
                >
                  <Settings size={17} />
                  <span>Settings</span>
                </button>

                <button
                  className="profile-dropdown-item danger"
                  onClick={() => {
                    setProfileOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={17} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="breadcrumb">Workspace / Overview</p>
              <h2>{active}</h2>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="icon-button notification">
              <Bell size={20} />
              <span />
            </button>

            <div className="topbar-profile">
              <div className="avatar">SP</div>

              <div>
                <strong>{dashboard?.user_name ?? "User"}</strong>
                <span>
                  {dashboard?.role?.toLowerCase() === "admin"
                    ? "Admin"
                    : "Member"}
                </span>
              </div>
            </div>

            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <section className="page-content">
          {loading && (
            <div className="loading-state">
              Loading live dashboard data...
            </div>
          )}

          {error && !loading && (
            <div className="error-message dashboard-error">
              {error}
              <button
                onClick={() => token && void loadDashboard(token)}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          )}

          {active === "Organizations" ? (
            <OrganizationsPage token={token} />
          ) : active === "Users" ? (
            <UsersPage token={token} organizationId={selectedWorkspaceId} />
          ) : active === "AI Insights" ? (
            <AIInsightsPage dashboard={dashboard} token={token} />
          ) : active === "Audit Logs" ? (
            <AuditLogsPage token={token} organizationId={selectedWorkspaceId} />
          ) : active === "Settings" ? (
            <SettingsPage dashboard={dashboard} onLogout={handleLogout} />
          ) : active === "Analytics" ? (
            <AnalyticsPage dashboard={dashboard} token={token} />
          ) : (
            !loading && dashboard && (
              <>
                <div className="welcome-row">
                <div>
                  <span className="eyebrow">
                    <span className="live-dot" />
                    LIVE INTELLIGENCE
                  </span>

                  <h3>
                    Good morning, {dashboard.user_name.split(" ")[0]}.
                  </h3>

                  <p>
                    Here's what's happening across your organization today.
                  </p>
                </div>

                <button className="date-button">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="metric-grid">
                {metrics.map((metric) => {
                  const Icon = metric.icon;

                  return (
                    <div className="metric-card" key={metric.label}>
                      <div className="metric-top">
                        <div className="metric-icon">
                          <Icon size={20} />
                        </div>

                        <span className="metric-change">
                          {metric.change}
                        </span>
                      </div>

                      <span className="metric-label">{metric.label}</span>

                      <strong className="metric-value">{metric.value}</strong>

                      <span className="metric-period">
                        Current organization data
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="content-grid">
                <section className="panel chart-panel">
                  <div className="panel-header">
                    <div>
                      <span className="panel-kicker">PERFORMANCE</span>
                      <h4>Operational Activity</h4>
                    </div>

                    <button className="small-select">
                      Last 7 days
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <div className="chart">
                    <div className="chart-y">
                      <span>100</span>
                      <span>75</span>
                      <span>50</span>
                      <span>25</span>
                      <span>0</span>
                    </div>

                    <div className="chart-area">
                      <div className="grid-lines">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>

                      <svg
                        viewBox="0 0 700 260"
                        preserveAspectRatio="none"
                        className="chart-svg"
                      >
                        <defs>
                          <linearGradient
                            id="area"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                          >
                            <stop offset="0%" stopOpacity="0.25" />
                            <stop offset="100%" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        <path
                          className="chart-fill"
                          d="M0,205 C70,190 80,165 145,175 C210,185 220,120 285,135 C350,150 370,100 425,112 C485,125 505,70 555,88 C610,105 625,52 700,38 L700,260 L0,260 Z"
                        />

                        <path
                          className="chart-line"
                          d="M0,205 C70,190 80,165 145,175 C210,185 220,120 285,135 C350,150 370,100 425,112 C485,125 505,70 555,88 C610,105 625,52 700,38"
                        />
                      </svg>

                      <div className="chart-labels">
                        <span>Sep 26</span>
                        <span>Sep 27</span>
                        <span>Sep 28</span>
                        <span>Sep 29</span>
                        <span>Sep 30</span>
                        <span>Oct 1</span>
                        <span>Oct 2</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="panel insight-panel">
                  <div className="panel-header">
                    <div>
                      <span className="panel-kicker">AI ENGINE</span>
                      <h4>Latest Insights</h4>
                    </div>

                    <button className="view-button">View all</button>
                  </div>

                  <div className="insight-list">
                    {fallbackInsights.map((insight) => {
                      const Icon = insight.icon;

                      return (
                        <div className="insight-item" key={insight.title}>
                          <div className="insight-icon">
                            <Icon size={18} />
                          </div>

                          <div>
                            <div className="insight-title">
                              <strong>{insight.title}</strong>
                              <span>{insight.type}</span>
                            </div>

                            <p>{insight.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <section className="panel activity-panel">
                <div className="panel-header">
                  <div>
                    <span className="panel-kicker">ORGANIZATION</span>
                    <h4>Recent Activity</h4>
                  </div>

                  <button className="view-button">
                    {dashboard.audit_events} audit events
                  </button>
                </div>

                <div className="activity-list">
                  {activities.length === 0 && (
                    <div className="activity-row">
                      <div className="activity-icon">
                        <CheckCircle2 size={18} />
                      </div>

                      <div className="activity-info">
                        <strong>No recent activity</strong>
                        <span>
                          No audit events have been recorded recently.
                        </span>
                      </div>
                    </div>
                  )}

                  {activities.map((activity, index) => {
                    const Icon = getActivityIcon(activity.action);

                    return (
                      <div
                        className="activity-row"
                        key={`${activity.action}-${activity.created_at}-${index}`}
                      >
                        <div className="activity-icon">
                          <Icon size={18} />
                        </div>

                        <div className="activity-info">
                          <strong>
                            {formatActivityAction(activity.action)}
                          </strong>

                          <span>
                            {activity.resource_type} activity recorded
                          </span>
                        </div>

                        <time>
                          {formatRelativeTime(activity.created_at)}
                        </time>
                      </div>
                    );
                  })}
                </div>
              </section>
              </>
            )
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
