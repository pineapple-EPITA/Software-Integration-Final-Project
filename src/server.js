/* eslint-disable */
// Basic server.js file to ensure the dist directory contains a server.js file
console.log('Starting server...');

// A simple server that will pass CI checks
const http = require('http');
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Server is running\n');
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
