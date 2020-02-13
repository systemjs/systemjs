const http = require('http');
const fs = require('fs');
const path = require('path');
const { once } = require('events');
const { pathToFileURL, fileURLToPath } = require('url');
const opn = require('opn');

const port = 8085;

const systemJSURL = pathToFileURL(path.resolve(__dirname, '..') + '/');

const mimes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.wasm': 'application/wasm'
};

let failTimeout, browserTimeout;

function setBrowserTimeout () {
  if (browserTimeout)
    clearTimeout(browserTimeout);
  browserTimeout = setTimeout(() => {
    console.log('No browser requests made to server for 10s, closing.');
    process.exit(0);
  }, 10000);
}

setBrowserTimeout();

http.createServer(async function (req, res) {
  setBrowserTimeout();
  if (req.url === '/done') {
    console.log('Tests completed successfully.');
    process.exit();
    return;
  }
  else if (req.url === '/error') {
    console.log('\033[31mTest failures found.\033[0m');
    failTimeout = setTimeout(() => process.exit(1), 30000);
  }
  else if (failTimeout) {
    clearTimeout(failTimeout);
    failTimeout = null;
  }

  const url = new URL(req.url[0] === '/' ? req.url.slice(1) : req.url, systemJSURL);
  const filePath = fileURLToPath(url);

  // redirect to test/test.html file by default
  if (url.href === systemJSURL.href) {
    res.writeHead(301, {
      'location': '/test/test.html'
    });
    res.end();
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  try {
    await once(fileStream, 'readable');
  }
  catch (e) {
    if (e.code === 'EISDIR' || e.code === 'ENOENT') {
      res.writeHead(404, {
        'content-type': 'text/html'
      });
      res.end(`File not found.`);
    }
    return;
  }

  let mime;
  if (filePath.endsWith('javascript.css'))
    mime = 'application/javascript';
  else
    mime = mimes[path.extname(filePath)] || 'text/plain';

  res.writeHead(200, {
    'content-type': mime
  });
  fileStream.pipe(res);
  await once(fileStream, 'end');
  res.end();
}).listen(port);

console.log(`Test server listening on http://localhost:${port}\n`);
opn(`http://localhost:${port}/test/test.html`);
