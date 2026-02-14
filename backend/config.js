// backend/config.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
    // Server configuration
    PORT: process.env.PORT || 3001,
    
    // File paths
    DATA_DIR: path.join(__dirname, 'data'),
    INCIDENTS_FILE: path.join(__dirname, 'data', 'incidents.json'),
    
    // Application configuration
    DEFAULT_SHOW_ARCHIVED: false,
    
    // Status definitions
    STATUSES: {
        OPEN: 'OPEN',
        INVESTIGATING: 'INVESTIGATING',
        RESOLVED: 'RESOLVED',
        ARCHIVED: 'ARCHIVED'
    },
    
    // Archive rules
    ARCHIVE_ALLOWED_FROM: ['OPEN', 'RESOLVED'],
    UNARCHIVE_TO: 'OPEN'
};