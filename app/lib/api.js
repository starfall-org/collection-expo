import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://collection-backend.deno.dev";
const CACHE_DURATION = 60 * 60 * 1000;

const getCachedData = async (key) => {
  try {
    const item = await AsyncStorage.getItem(key);
    if (item) {
      const parsedItem = JSON.parse(item);
      if (parsedItem.expiry > Date.now()) {
        return parsedItem.data;
      }
      await AsyncStorage.removeItem(key);
    }
    return null;
  } catch (error) {
    console.error("Error reading from AsyncStorage:", error);
    return null;
  }
};

const setCachedData = async (key, data) => {
  try {
    const item = {
      data,
      expiry: Date.now() + CACHE_DURATION,
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error("Error writing to AsyncStorage:", error);
  }
};

const listFiles = async () => {
  const cachedFiles = await getCachedData("files");
  if (cachedFiles) return cachedFiles;

  try {
    const response = await fetch(`${API_URL}/api/files`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const files = await response.json();
    await setCachedData("files", files);
    return files;
  } catch (error) {
    console.error("Error listing files:", error);
  }
};

const getSource = async (fileName) => {
  const cachedUrl = await getCachedData(fileName);
  if (cachedUrl) return cachedUrl;

  try {
    const response = await fetch(
      `${API_URL}/api/presigned-url/${encodeURIComponent(fileName)}`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    await setCachedData(fileName, data.url);
    return data.url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return null;
  }
};

export { listFiles, getSource };
