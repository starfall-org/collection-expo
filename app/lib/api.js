const API_URL = process.env.API_URL;

const cache = new Map();
const cacheExpiry = new Map();
const CACHE_DURATION = 60 * 60 * 1000;

const listFiles = async () => {
  if (cache.has("files")) {
    const expiry = cacheExpiry.get("files");
    if (expiry && expiry > Date.now()) {
      return cache.get("files");
    }
    cache.delete("files");
    cacheExpiry.delete("files");
  }
  try {
    const response = await fetch(`${API_URL}/api/files`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const files = await response.json();
    cache.set("files", files);
    cacheExpiry.set("files", Date.now() + CACHE_DURATION);
    return files;
  } catch (error) {
    console.error("Error listing files:", error);
  }
};

const getSource = async (fileName) => {
  if (cache.has(fileName)) {
    const expiry = cacheExpiry.get(fileName);
    if (expiry && expiry > Date.now()) {
      return cache.get(fileName);
    }
    cache.delete(fileName);
    cacheExpiry.delete(fileName);
  }
  try {
    const response = await fetch(
      `${API_URL}/api/presigned-url/${encodeURIComponent(fileName)}`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    cache.set(fileName, data.url);
    cacheExpiry.set(fileName, Date.now() + CACHE_DURATION);
    return data.url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return null;
  }
};

export { listFiles, getSource };
