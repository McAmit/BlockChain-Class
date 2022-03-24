const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

// two way to write functions:
// 1. (request,response) => {}
// 2. function(request, response) {}
const server = http.createServer((req, res) => {
  // 1.1
  // res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/plain');

  // 1.2 the same like 1.1
    res.writeHead(200,{'Content-Type':'text/plain'})
  // 2.
    res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

