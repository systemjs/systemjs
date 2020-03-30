import fetch from 'node-fetch';

global.System.constructor.prototype.shouldFetch = () => true;
global.System.constructor.prototype.fetch = url => fetch(url);
