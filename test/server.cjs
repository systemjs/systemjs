const http = require('http');
const fs = require('fs');
const path = require('path');
const { once } = require('events');
const { pathToFileURL, fileURLToPath } = require('url');
const open = require('open');

const port = 8080;

const systemJSURL = pathToFileURL(path.resolve(__dirname, '..') + '/');

const mimes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.wasm': 'application/wasm'
};

const shouldExit = process.env.WATCH_MODE !== 'true'

let failTimeout, browserTimeout;

function setBrowserTimeout () {
  if (!shouldExit)
    return;
  if (browserTimeout)
    clearTimeout(browserTimeout);
  browserTimeout = setTimeout(() => {
    console.log('No browser requests made to server for 10s, closing.');
    process.exit(failTimeout ? 1 : 0);
  }, 10000);
}

setBrowserTimeout();

http.createServer(async function (req, res) {
  setBrowserTimeout();
  if (req.url === '/done') {
    console.log('Tests completed successfully.');
    if (shouldExit) {
      process.exit();
    }
    return;
  }
  else if (req.url === '/error') {
    console.log('\033[31mTest failures found.\033[0m');
    if (shouldExit) {
      failTimeout = setTimeout(() => process.exit(1), 30000);
    }
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
  else if (filePath.endsWith('content-type-xml.json'))
    mime = 'application/xml';
  else
    mime = mimes[path.extname(filePath)] || 'text/plain';

  const headers = filePath.endsWith('content-type-none.json') ?
    {} : { 'content-type': mime, 'Cache-Control': 'no-cache' }

  res.writeHead(200, headers);
  fileStream.pipe(res);
  await once(fileStream, 'end');
  res.end();
}).listen(port);

console.log(`Test server listening on http://localhost:${port}\n`);
const openOptions = process.env.CI ? { app: ['firefox'] } : {};
open(`http://localhost:${port}/test/test.html`, openOptions);
