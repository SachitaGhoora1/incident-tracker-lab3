import app from "./src/app.js";
import { config } from './config.js';
import { loadIncidents } from './src/store/incidents.store.js';

// Load incidents before starting the server
loadIncidents().then(() => {
  app.listen(config.PORT, () => {
    console.log(`IncidentTracker API running on http://localhost:${config.PORT}`);
    console.log(`Data file: ${config.INCIDENTS_FILE}`);
    console.log(`Show archived by default: ${config.DEFAULT_SHOW_ARCHIVED}`);
  });
}).catch(error => {
  console.error('Failed to load incidents:', error);
  process.exit(1);
});

