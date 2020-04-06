if (typeof process === 'undefined')
  global.process = {
    env: {
      TRACING: true,
      DEV: true
    }
  };
