// frontend/config.js
export const config = {
    // API configuration
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
    
    // Application configuration
    DEFAULT_SHOW_ARCHIVED: false,
    
    // Status definitions
    STATUSES: {
        OPEN: 'OPEN',
        INVESTIGATING: 'INVESTIGATING',
        RESOLVED: 'RESOLVED',
        ARCHIVED: 'ARCHIVED'
    },
    
    // Status display colors
    STATUS_COLORS: {
        OPEN: 'tag-info',
        INVESTIGATING: 'tag-warn',
        RESOLVED: 'tag-success',
        ARCHIVED: 'tag-muted'
    },
    
    // Archive rules
    ARCHIVE_ALLOWED_FROM: ['OPEN', 'RESOLVED'],
    UNARCHIVE_TO: 'OPEN'
};