export const optimizeImageUrl = (url: string | null | undefined, width = 600) => {
  if (!url) return '';
  if (url.includes('unsplash.com')) {
    // If it already has some parameters, append webp
    if (url.includes('?')) {
      return `${url}&fm=webp&w=${width}&q=80`;
    }
    return `${url}?auto=format&fm=webp&fit=crop&w=${width}&q=80`;
  }
  return url;
};
