export let baseUrl = location.href.split('#')[0].split('?')[0];
const lastSepIndex = baseUrl.lastIndexOf('/');
if (lastSepIndex !== -1)
  baseUrl = baseUrl.substr(0, lastSepIndex + 1);