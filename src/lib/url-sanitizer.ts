export const sanitizeBaseUrl = (url: string): string => {
  // Remove trailing slashes and colons, but preserve the protocol
  return url.replace(/[:/]+$/, '');
};

export const constructMemorialUrl = (baseUrl: string, path: string): string => {
  const sanitizedBase = sanitizeBaseUrl(baseUrl);
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${sanitizedBase}${sanitizedPath}`;
};