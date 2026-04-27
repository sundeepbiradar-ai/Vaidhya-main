const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BUILD_DIR = path.join(__dirname, 'build');

const server = http.createServer((req, res) => {
  let filePath = path.join(BUILD_DIR, req.url);

  // If the request is for a directory or doesn't have an extension, serve index.html (SPA routing)
  if (req.url === '/' || !path.extname(filePath)) {
    filePath = path.join(BUILD_DIR, 'index.html');
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      // If file not found, serve index.html
      fs.readFile(path.join(BUILD_DIR, 'index.html'), 'utf8', (indexErr, indexData) => {
        if (indexErr) {
          res.writeHead(500);
          res.end('Error loading index.html');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexData);
      });
      return;
    }

    // Determine content type
    const ext = path.extname(filePath);
    let contentType = 'text/plain';
    if (ext === '.html') contentType = 'text/html';
    else if (ext === '.js') contentType = 'text/javascript';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.ico') contentType = 'image/x-icon';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
});
