import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import { File, Paths } from "expo-file-system/next";
import { ToastAndroid } from "react-native";

const API_URL = "https://api.flaring.workers.dev";

const getCachedData = async (key) => {
  try {
    const item = await AsyncStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  } catch (error) {
    ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
    console.error("Error reading from AsyncStorage:", error);
    return null;
  }
};

const setCachedData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
    console.error("Error writing to AsyncStorage:", error);
  }
};

const storeFile = async (filename, url) => {
  try {
    const file = new File(Paths.cache, filename);
    file.create();
    const output = await File.downloadFileAsync(url, file);
    return output;
  } catch (error) {
    ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
    console.error("Error downloading file:", error);
    return null;
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
      ToastAndroid.show("Network error", ToastAndroid.SHORT);
      throw new Error("Network response was not ok");
    }
    const files = await response.json();
    await setCachedData("files", files);
    return files;
  } catch (error) {
    ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
    console.error("Error listing files:", error);
  }
};

const getSource = async (fileName) => {
  const existingFile = new File(Paths.cache, fileName);
  if (existingFile.exists) {
    return existingFile.uri;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/presigned-url/${encodeURIComponent(fileName)}`
    );
    const { url } = await response.json();
    if (!response.ok) {
      ToastAndroid.show("Network error", ToastAndroid.SHORT);
      throw new Error("Network response was not ok");
    }
    await storeFile(fileName, url);
    return url;
  } catch (error) {
    ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
    console.error("Error generating presigned URL:", error);
    return null;
  }
};

export { listFiles, getSource };
