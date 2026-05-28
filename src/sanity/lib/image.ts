/**
 * Mock URL builder for post images.
 * Transparently supports local file paths and external URLs without requiring a Sanity project endpoint.
 * Satisfies the exact API used by components: urlFor(source).url()
 */
export const urlFor = (source: any) => {
  return {
    url: (): string => {
      if (!source) return "";
      
      // 1. If the source is a plain string (local file path or external URL)
      if (typeof source === "string") {
        return source;
      }
      
      // 2. If it has a nested url parameter (local database mock structure)
      if (source.url && typeof source.url === "string") {
        return source.url;
      }
      
      // 3. If it has a nested asset.url parameter (Sanity legacy compatibility)
      if (source.asset && typeof source.asset.url === "string") {
        return source.asset.url;
      }
      
      // 4. Default fallback
      return "";
    }
  };
};
