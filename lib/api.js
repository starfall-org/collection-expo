import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import { File, Paths } from "expo-file-system/next";

const API_URL = "https://api.flaring.workers.dev";

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
  const networkState = await Network.getNetworkStateAsync();
  const cachedFiles = await getCachedData("files");
  if (!networkState.isConnected && cachedFiles) {
    return cachedFiles;
  }
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
  const file = new File(Paths.cache, fileName);
  const cached = await getCachedData(fileName);
  if (cached && file.exists) return file.uri;
  file.create();
  try {
    const response = await fetch(
      `${API_URL}/api/presigned-url/${encodeURIComponent(fileName)}`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    const fileData = await fetch(data.url);
    const bytes = await fileData.arrayBuffer();
    file.write(bytes);
    await setCachedData(fileName, fileName);
    return file.uri;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return null;
  }
};

export { listFiles, getSource };
