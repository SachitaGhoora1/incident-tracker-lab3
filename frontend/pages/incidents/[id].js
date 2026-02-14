import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import ErrorBanner from "../../components/ErrorBanner";
import { changeIncidentStatus, getIncident, archiveIncident, unarchiveIncident } from "../../services/api";
import { config } from "../../config.js";

const STATUS_FLOW = {
  [config.STATUSES.OPEN]: [config.STATUSES.INVESTIGATING],
  [config.STATUSES.INVESTIGATING]: [config.STATUSES.RESOLVED],
  [config.STATUSES.RESOLVED]: [],
  [config.STATUSES.ARCHIVED]: []
};

export default function IncidentDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      setErr("");
      const data = await getIncident(id);
      setItem(data);

      const allowed = STATUS_FLOW[data.status] || [];
      setNextStatus(allowed[0] || "");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const allowedNext = useMemo(() => {
    if (!item) return [];
    return STATUS_FLOW[item.status] || [];
  }, [item]);

  async function onUpdateStatus() {
    if (!item || !nextStatus) return;
    try {
      setUpdating(true);
      setErr("");
      const updated = await changeIncidentStatus(item.id, nextStatus);
      setItem(updated);
      const newAllowed = STATUS_FLOW[updated.status] || [];
      setNextStatus(newAllowed[0] || "");
    } catch (e) {
      setErr(e.message);
    } finally {
      setUpdating(false);
    }
  }

  async function onArchive() {
    if (!item || !confirm("Are you sure you want to archive this incident? It will be hidden from the dashboard by default.")) return;
    try {
      setUpdating(true);
      setErr("");
      const updated = await archiveIncident(item.id);
      setItem(updated);
      setNextStatus("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setUpdating(false);
    }
  }

  async function onUnarchive() {
    if (!item || !confirm("Are you sure you want to unarchive this incident? It will be set to OPEN status.")) return;
    try {
      setUpdating(true);
      setErr("");
      const updated = await unarchiveIncident(item.id);
      setItem(updated);
      setNextStatus(config.STATUSES.INVESTIGATING);
    } catch (e) {
      setErr(e.message);
    } finally {
      setUpdating(false);
    }
  }

  // Get status color class
  const getStatusColor = (status) => {
    return config.STATUS_COLORS[status] || '';
  };

  return (
    <Layout title="Incident Details">
      <ErrorBanner message={err} />

      {loading && <div className="muted">Loading...</div>}

      {!loading && item && (
        <div className="panel">
          <div className="panel-title">{item.title}</div>
          <div className="panel-body">
            <div className="meta">
              <div><strong>ID:</strong> <span className="mono">{item.id}</span></div>
              <div><strong>Category:</strong> <span className="tag">{item.category}</span></div>
              <div><strong>Severity:</strong> 
                <span className={`tag ${item.severity === "HIGH" ? "tag-danger" : item.severity === "MEDIUM" ? "tag-warn" : ""}`}>
                  {item.severity}
                </span>
              </div>
              <div><strong>Status:</strong> 
                <span className={`tag ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div><strong>Reported:</strong> <span className="mono">{(item.reportedAt || "").slice(0, 19).replace("T", " ")}</span></div>
            </div>

            <div className="section">
              <div className="section-title">Description</div>
              <div className="box">{item.description}</div>
            </div>

            <div className="section">
              <div className="section-title">Update Status</div>

              {allowedNext.length === 0 ? (
                <div className="muted">No further transitions available.</div>
              ) : (
                <div className="row">
                  <select className="select" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                    {allowedNext.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="btn" onClick={onUpdateStatus} disabled={!nextStatus || updating}>
                    {updating ? "Updating..." : "Update"}
                  </button>
                </div>
              )}
            </div>

            {/* Archive Section */}
            <div className="section">
              <div className="section-title">Archive Management</div>
              
              {item.status === config.STATUSES.ARCHIVED ? (
                <div>
                  <button 
                    className="btn btn-warning" 
                    onClick={onUnarchive}
                    disabled={updating}
                  >
                    {updating ? "Processing..." : "Unarchive (Set to OPEN)"}
                  </button>
                  <p className="muted" style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>
                    This will move the incident from ARCHIVED back to OPEN status.
                  </p>
                </div>
              ) : config.ARCHIVE_ALLOWED_FROM.includes(item.status) ? (
                <div>
                  <button 
                    className="btn btn-secondary" 
                    onClick={onArchive}
                    disabled={updating}
                  >
                    {updating ? "Processing..." : "Archive Incident"}
                  </button>
                  <p className="muted" style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>
                    Archived incidents are hidden from the dashboard by default. You can show them using the "Show Archived" checkbox.
                  </p>
                </div>
              ) : (
                <div className="muted">
                  Cannot archive incident in {item.status} status. Only OPEN or RESOLVED incidents can be archived.
                </div>
              )}
            </div>

            <div className="row" style={{marginTop: '1rem'}}>
              <button className="btn btn-secondary" onClick={() => router.push("/incidents")}>Back to list</button>
            </div>
          </div>
        </div>
      )}

      {!loading && !item && !err && (
        <div className="muted">No incident selected.</div>
      )}
    </Layout>
  );
}