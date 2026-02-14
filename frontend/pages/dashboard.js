import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ErrorBanner from "../components/ErrorBanner";
import { listIncidents } from "../services/api";
import { config } from "../config.js";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(config.DEFAULT_SHOW_ARCHIVED);

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const data = await listIncidents(includeArchived);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [includeArchived]);

  // Filter out archived incidents for the main dashboard counts (unless includeArchived is true)
  const visibleItems = includeArchived 
    ? items 
    : items.filter(i => i.status !== config.STATUSES.ARCHIVED);

  const archivedCount = items.filter(i => i.status === config.STATUSES.ARCHIVED).length;

  // Calculate stats
  const stats = {
    total: visibleItems.length,
    open: visibleItems.filter(i => i.status === config.STATUSES.OPEN).length,
    investigating: visibleItems.filter(i => i.status === config.STATUSES.INVESTIGATING).length,
    resolved: visibleItems.filter(i => i.status === config.STATUSES.RESOLVED).length,
    high: visibleItems.filter(i => i.severity === "HIGH").length,
    archived: archivedCount
  };

  // Group incidents by status
  const byStatus = {
    [config.STATUSES.OPEN]: visibleItems.filter(i => i.status === config.STATUSES.OPEN),
    [config.STATUSES.INVESTIGATING]: visibleItems.filter(i => i.status === config.STATUSES.INVESTIGATING),
    [config.STATUSES.RESOLVED]: visibleItems.filter(i => i.status === config.STATUSES.RESOLVED),
  };

  // Only show archived in separate section if includeArchived is true
  const archivedIncidents = items.filter(i => i.status === config.STATUSES.ARCHIVED);

  // Get status color class
  const getStatusColor = (status) => {
    return config.STATUS_COLORS[status] || '';
  };

  return (
    <Layout title="Dashboard">
      <ErrorBanner message={err} />

      {/* Controls */}
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
          />
          <span>Show Archived Incidents</span>
          {archivedCount > 0 && (
            <span className="tag tag-muted" style={{ marginLeft: '0.5rem' }}>
              {archivedCount} archived
            </span>
          )}
        </label>
      </div>

      {/* KPI Cards */}
      <div className="kpis">
        <div className="kpi">
          <div className="kpi-label">Total</div>
          <div className="kpi-value">{stats.total}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Open</div>
          <div className="kpi-value">{stats.open}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Investigating</div>
          <div className="kpi-value">{stats.investigating}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Resolved</div>
          <div className="kpi-value">{stats.resolved}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">High Severity</div>
          <div className="kpi-value">{stats.high}</div>
        </div>
      </div>

      {/* Incidents by Status */}
      <div className="grid3">
        {/* Open Column */}
        <div className="panel">
          <div className="panel-title">
            OPEN ({byStatus[config.STATUSES.OPEN].length})
          </div>
          <div className="panel-body">
            {byStatus[config.STATUSES.OPEN].length === 0 ? (
              <div className="muted">No incidents</div>
            ) : (
              byStatus[config.STATUSES.OPEN].map(inc => (
                <div key={inc.id} className="card">
                  <div className="card-title">
                    <a className="link" href={`/incidents/${inc.id}`}>{inc.title}</a>
                  </div>
                  <div className="card-meta">
                    <span className={`tag ${inc.severity === "HIGH" ? "tag-danger" : inc.severity === "MEDIUM" ? "tag-warn" : ""}`}>
                      {inc.severity}
                    </span>
                    <span className="tag">{inc.category}</span>
                  </div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    {new Date(inc.reportedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Investigating Column */}
        <div className="panel">
          <div className="panel-title">
            INVESTIGATING ({byStatus[config.STATUSES.INVESTIGATING].length})
          </div>
          <div className="panel-body">
            {byStatus[config.STATUSES.INVESTIGATING].length === 0 ? (
              <div className="muted">No incidents</div>
            ) : (
              byStatus[config.STATUSES.INVESTIGATING].map(inc => (
                <div key={inc.id} className="card">
                  <div className="card-title">
                    <a className="link" href={`/incidents/${inc.id}`}>{inc.title}</a>
                  </div>
                  <div className="card-meta">
                    <span className={`tag ${inc.severity === "HIGH" ? "tag-danger" : inc.severity === "MEDIUM" ? "tag-warn" : ""}`}>
                      {inc.severity}
                    </span>
                    <span className="tag">{inc.category}</span>
                  </div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    {new Date(inc.reportedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resolved Column */}
        <div className="panel">
          <div className="panel-title">
            RESOLVED ({byStatus[config.STATUSES.RESOLVED].length})
          </div>
          <div className="panel-body">
            {byStatus[config.STATUSES.RESOLVED].length === 0 ? (
              <div className="muted">No incidents</div>
            ) : (
              byStatus[config.STATUSES.RESOLVED].map(inc => (
                <div key={inc.id} className="card">
                  <div className="card-title">
                    <a className="link" href={`/incidents/${inc.id}`}>{inc.title}</a>
                  </div>
                  <div className="card-meta">
                    <span className={`tag ${inc.severity === "HIGH" ? "tag-danger" : inc.severity === "MEDIUM" ? "tag-warn" : ""}`}>
                      {inc.severity}
                    </span>
                    <span className="tag">{inc.category}</span>
                  </div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    {new Date(inc.reportedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Archived Section (only shown when includeArchived is true) */}
      {includeArchived && archivedIncidents.length > 0 && (
        <div className="panel" style={{ marginTop: '1.5rem' }}>
          <div className="panel-title" style={{ backgroundColor: '#f0f0f0' }}>
            ARCHIVED ({archivedIncidents.length})
          </div>
          <div className="panel-body">
            <div className="grid3">
              {archivedIncidents.map(inc => (
                <div key={inc.id} className="card" style={{ opacity: 0.8 }}>
                  <div className="card-title">
                    <a className="link" href={`/incidents/${inc.id}`}>{inc.title}</a>
                  </div>
                  <div className="card-meta">
                    <span className={`tag ${inc.severity === "HIGH" ? "tag-danger" : inc.severity === "MEDIUM" ? "tag-warn" : ""}`}>
                      {inc.severity}
                    </span>
                    <span className="tag">{inc.category}</span>
                    <span className="tag tag-muted">ARCHIVED</span>
                  </div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    {new Date(inc.reportedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info message when showing archived */}
      {includeArchived && archivedIncidents.length === 0 && (
        <div className="archive-info" style={{ marginTop: '1rem' }}>
          No archived incidents to display.
        </div>
      )}
    </Layout>
  );
}
