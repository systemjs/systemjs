if (typeof process === 'undefined')
  global.process = { env: {} };
process.env.SYSTEM_TRACING = 1;
process.env.SYSTEM_DEV = 1;
