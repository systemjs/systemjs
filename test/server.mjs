import http from "http";
import fs from "fs/promises";
import {once} from "events";
import path from "path";
import {fileURLToPath} from "url";
import open from "open";
import kleur from 'kleur';
import { spawn } from 'child_process';

const port = 8080;

const rootURL = new URL("..", import.meta.url);

const mimes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.wasm': 'application/wasm'
};

const shouldExit = process.env.WATCH_MODE !== 'true';
const testName = process.argv[2] ?? 'test';

let retry = process.env.CI_BROWSER ? 0 : 1;

// Dont run Chrome tests on Firefox
if (testName.startsWith('test-chrome') && process.env.CI_BROWSER && !process.env.CI_BROWSER.includes('chrome'))
  process.exit(0);

let failTimeout, browserTimeout;

function setBrowserTimeout () {
  if (!shouldExit)
    return;
  if (browserTimeout)
    clearTimeout(browserTimeout);
  browserTimeout = setTimeout(() => {
    retry += 1;
    if (retry > 1) {
      console.log('No browser requests made to server for 10s, closing.');
      process.exit(failTimeout || process.env.CI_BROWSER ? 1 : 0);
    }
    else {
      console.log('Retrying...');
      start();
    }
  }, 20000);
}

setBrowserTimeout();

http.createServer(async function (req, res) {
  // Helps CI debugging:
  if (process.env.CI_BROWSER)
    console.log("REQ: " + req.url);
  setBrowserTimeout();
  if (req.url.startsWith('/done')) {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('');
    console.log(kleur.green('Tests completed successfully.'));
    if (browserTimeout)
      clearTimeout(browserTimeout);
    const message = new URL(req.url, rootURL).searchParams.get('message');
    if (message) console.log(message);
    if (shouldExit) {
      if (spawnPs)
        spawnPs.kill('SIGKILL');
      setTimeout(() => process.exit(), 500);
    }
    return;
  }
  else if (req.url === '/error') {
    const msg = decodeURIComponent(req.url.slice(7));
    console.log(kleur.red('Test failure: ') + msg);
    if (shouldExit) {
      failTimeout = setTimeout(() => process.exit(1), 30000);
    }
  }
  else if (failTimeout) {
    clearTimeout(failTimeout);
    failTimeout = null;
  }

  const url = new URL(req.url[0] === '/' ? req.url.slice(1) : req.url, rootURL);
  const filePath = fileURLToPath(url);

  // redirect to test/test.html file by default
  if (url.href === rootURL.href) {
    res.writeHead(301, {
      'location': '/test/test.html'
    });
    res.end();
    return;
  }

  try {
    var source = await fs.readFile(filePath);
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

  if (mime !== 'application/wasm')
    source = source.toString('utf8').replace(/\r\n/g, '\n');

  res.writeHead(200, headers);
  res.end(source);
}).listen(port);

let spawnPs;
function start () {
  if (process.env.CI_BROWSER) {
    const args = process.env.CI_BROWSER_FLAGS ? process.env.CI_BROWSER_FLAGS.split(' ') : [];
    console.log('Spawning browser: ' + process.env.CI_BROWSER + ' ' + args.join(' '));
    spawnPs = spawn(process.env.CI_BROWSER, [...args, `http://localhost:${port}/test/${testName}.html`]);
  }
  else {
    open(`http://localhost:${port}/test/${testName}.html`, { app: { name: open.apps.firefox } });
  }
}

start();
