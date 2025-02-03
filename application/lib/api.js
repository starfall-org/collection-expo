const API_URL = "https://collection-backend.deno.dev";

const cache = new Map();

const listFiles = async () => {
  if (cache.has("files")) {
    return cache.get("files");
  }
  try {
    const response = await fetch(`${API_URL}/api/files`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const files = await response.json();

    cache.set("files", files);
    return files;
  } catch (error) {
    console.error("Error listing files:", error);
  }
};

const getSource = async (fileName) => {
  try {
    const response = await fetch(
      `${API_URL}/api/presigned-url/${encodeURIComponent(fileName)}`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return null;
  }
};

export { listFiles, getSource };
