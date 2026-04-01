const configuredApiBaseUrl =
  'https://mission13-whitney-backend-ffb2g0fmhkgcbdhm.centralus-01.azurewebsites.net';

const apiBaseUrl = configuredApiBaseUrl
  ? configuredApiBaseUrl.replace(/\/+$/, '')
  : '/api';

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}
