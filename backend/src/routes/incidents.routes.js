import express from "express";
import multer from "multer";

import { 
  listAll, 
  findById, 
  createIncident, 
  updateStatus,
  archiveIncident,
  unarchiveIncident,
  deleteIncident 
} from "../store/incidents.store.js";
import { parseCsvBuffer } from "../utils/csv.js";
import { validateCreateIncident, validateStatusChange } from "../utils/validate.js";
import { config } from '../../config.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Get all incidents with optional archived filter
router.get("/", (req, res) => {
  const includeArchived = req.query.includeArchived === 'true';
  const incidents = listAll(includeArchived);
  res.json(incidents);
});

router.get("/:id", (req, res) => {
  const incident = findById(req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });
  res.json(incident);
});

router.post("/", async (req, res) => {
  const result = validateCreateIncident(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.errors });
  }

  try {
    const incident = await createIncident(result.value);
    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ error: "Failed to create incident" });
  }
});

router.patch("/:id/status", async (req, res) => {
  const incident = findById(req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  const check = validateStatusChange(incident.status, req.body.status);
  if (!check.ok) return res.status(400).json({ error: check.error });

  try {
    const updated = await updateStatus(incident.id, check.next);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Archive an incident
router.post("/:id/archive", async (req, res) => {
  try {
    const incident = await archiveIncident(req.params.id);
    if (!incident) return res.status(404).json({ error: "Incident not found" });
    res.json(incident);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Unarchive an incident
router.post("/:id/unarchive", async (req, res) => {
  try {
    const incident = await unarchiveIncident(req.params.id);
    if (!incident) return res.status(404).json({ error: "Incident not found" });
    res.json(incident);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an incident (optional, for cleanup)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteIncident(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Incident not found" });
    res.json({ message: "Incident deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete incident" });
  }
});

router.post("/bulk-upload", upload.single("file"), async (req, res) => {
  try {
    const records = await parseCsvBuffer(req.file.buffer);

    let created = 0;
    let skipped = 0;

    for (const row of records) {
      const result = validateCreateIncident(row);
      if (!result.ok) {
        skipped++;
        continue;
      }
      await createIncident(result.value);
      created++;
    }

    res.json({
      totalRows: records.length,
      created,
      skipped
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to process bulk upload" });
  }
});

export default router;