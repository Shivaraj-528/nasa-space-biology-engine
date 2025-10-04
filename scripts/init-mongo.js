// Initialize MongoDB collections and indexes for NASA Space Biology Engine
// This is a placeholder. Extend with actual collections and indexes as needed.

// eslint-disable-next-line no-undef
const dbName = 'nasa_space_biology';
// eslint-disable-next-line no-undef
const db = db.getSiblingDB(dbName);

// Example collections
const collections = ['datasets', 'experiments', 'astronaut_health', 'users', 'logs'];
collections.forEach((name) => {
  if (!db.getCollectionNames().includes(name)) {
    db.createCollection(name);
  }
});

// Example indexes
// db.datasets.createIndex({ source: 1 });
// db.experiments.createIndex({ organism: 1, mission: 1 });

print(`[init-mongo] Initialized database: ${dbName}`);
