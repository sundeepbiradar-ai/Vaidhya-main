const app = require('./app');
const { port } = require('./config');
const { initializeJobs } = require('./jobs/refreshData');

const server = app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  initializeJobs();
});

module.exports = server;
