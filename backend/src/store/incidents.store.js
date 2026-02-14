import { randomUUID } from "crypto";
import fs from 'fs/promises';
import path from 'path';
import { config } from '../../config.js';

// Initialize incidents array
let incidents = [];

// Load incidents from file on startup
export async function loadIncidents() {
    try {
        const data = await fs.readFile(config.INCIDENTS_FILE, 'utf8');
        incidents = JSON.parse(data);
        console.log(`Loaded ${incidents.length} incidents from file`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist yet, start with empty array
            incidents = [];
            console.log('No existing incidents file found, starting fresh');
            await saveIncidents(); // Create the file
        } else {
            console.error('Error loading incidents:', error);
            incidents = [];
        }
    }
}

// Save incidents to file
async function saveIncidents() {
    try {
        // Ensure data directory exists
        await fs.mkdir(config.DATA_DIR, { recursive: true });
        await fs.writeFile(config.INCIDENTS_FILE, JSON.stringify(incidents, null, 2));
        console.log('Incidents saved to file');
    } catch (error) {
        console.error('Error saving incidents:', error);
        throw error;
    }
}

// Initialize by loading incidents
await loadIncidents();

export function listAll(includeArchived = false) {
    if (includeArchived) {
        return incidents;
    }
    // Filter out archived incidents by default
    return incidents.filter(i => i.status !== config.STATUSES.ARCHIVED);
}

export function findById(id) {
    return incidents.find(i => i.id === id);
}

export async function createIncident(data) {
    const incident = {
        id: randomUUID(),
        ...data,
        status: config.STATUSES.OPEN,
        reportedAt: new Date().toISOString(),
        archived: false
    };
    incidents.push(incident);
    await saveIncidents(); // Save to file
    return incident;
}

export async function updateStatus(id, status) {
    const incident = findById(id);
    if (!incident) return null;
    incident.status = status;
    await saveIncidents(); // Save to file
    return incident;
}

export async function archiveIncident(id) {
    const incident = findById(id);
    if (!incident) return null;
    
    // Check if incident can be archived (only from OPEN or RESOLVED)
    if (!config.ARCHIVE_ALLOWED_FROM.includes(incident.status)) {
        throw new Error(`Cannot archive incident from ${incident.status} status. Only OPEN or RESOLVED incidents can be archived.`);
    }
    
    incident.status = config.STATUSES.ARCHIVED;
    await saveIncidents();
    return incident;
}

export async function unarchiveIncident(id) {
    const incident = findById(id);
    if (!incident) return null;
    
    // Check if incident is archived
    if (incident.status !== config.STATUSES.ARCHIVED) {
        throw new Error('Can only unarchive ARCHIVED incidents');
    }
    
    incident.status = config.UNARCHIVE_TO; // Set to OPEN
    await saveIncidents();
    return incident;
}

export async function deleteIncident(id) {
    const index = incidents.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    const deleted = incidents.splice(index, 1)[0];
    await saveIncidents();
    return deleted;
}