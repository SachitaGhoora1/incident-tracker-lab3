import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import ErrorBanner from "../../components/ErrorBanner";
import { listIncidents } from "../../services/api";
import { config } from "../../config.js";

export default function IncidentsList() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [includeArchived, setIncludeArchived] = useState(config.DEFAULT_SHOW_ARCHIVED);

  async function load() {
    try {
      setErr("");
      const data = await listIncidents(includeArchived);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [includeArchived]);

  // Get status color class
  const getStatusColor = (status) => {
    return config.STATUS_COLORS[status] || '';
  };

  return (
    <Layout title="Incidents">
      <ErrorBanner message={err} />

      <div className="row" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={load}>Refresh</button>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
          />
          <span>Show Archived Incidents</span>
        </label>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reported</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="7" className="muted" style={{ textAlign: 'center', padding: '2rem' }}>No incidents found</td></tr>
            ) : (
              items.map(i => (
                <tr key={i.id} style={i.status === config.STATUSES.ARCHIVED ? { opacity: 0.7, backgroundColor: '#f9f9f9' } : {}}>
                  <td className="mono">{i.id.slice ? i.id.slice(0, 8) : i.id}</td>
                  <td>{i.title}</td>
                  <td><span className="tag">{i.category}</span></td>
                  <td>
                    <span className={`tag ${i.severity === "HIGH" ? "tag-danger" : i.severity === "MEDIUM" ? "tag-warn" : ""}`}>
                      {i.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`tag ${getStatusColor(i.status)}`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="mono">{(i.reportedAt || "").slice(0, 19).replace("T", " ")}</td>
                  <td><a className="link" href={`/incidents/${i.id}`}>View</a></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {includeArchived && items.filter(i => i.status === config.STATUSES.ARCHIVED).length > 0 && (
        <div className="archive-info" style={{ marginTop: '1rem' }}>
          <strong>Note:</strong> Showing {items.filter(i => i.status === config.STATUSES.ARCHIVED).length} archived incident(s)
        </div>
      )}
    </Layout>
  );
}