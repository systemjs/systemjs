if (typeof process === 'undefined')
  global.process = { env: {} };
process.env.SYSTEM_TRACING = 1;
