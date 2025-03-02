import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import { File, Paths } from "expo-file-system/next";

const API_URL = "https://api.flaring.workers.dev";

const getCachedData = async (key) => {
  try {
    const item = await AsyncStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  } catch (error) {
    console.error("Error reading from AsyncStorage:", error);
    return null;
  }
};

const setCachedData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
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
  const file = new File(Paths.document, fileName);
  if (file.exists) return file.uri;
  try {
    file.create();
    const response = await fetch(
      `${API_URL}/api/presigned-url/${encodeURIComponent(fileName)}`
    );
    const { url } = await response.json();
    if (!response.ok) throw new Error("Network response was not ok");
    const output = await File.downloadFileAsync(url, file);
    return output.uri;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return null;
  }
};

export { listFiles, getSource };
