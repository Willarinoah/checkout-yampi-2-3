export const generateMemorialUrl = async (coupleName: string): Promise<string> => {
  const baseUrl = window.location.origin;
  const slug = coupleName.toLowerCase().replace(/\s+/g, '-');
  return `${baseUrl}/memorial/${slug}`;
};