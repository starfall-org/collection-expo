import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import RNFS from "react-native-fs";
import { ToastAndroid } from "react-native";

const API_URL = "https://collection-api.deno.dev";
const APP_FOLDER = `${RNFS.ExternalDirectoryPath}`;

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
  const filePath = `${APP_FOLDER}/${filename}`;
  try {
    ToastAndroid.show("Downloading...", ToastAndroid.LONG);
    const output = await RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
    }).promise;
    return { uri: `file://${filePath}` };
  } catch (error) {
    ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
    console.error("Error downloading file:", error);
    await RNFS.unlink(filePath).catch(() => {});
  }
};

const fetchFromAPI = async (fileName) => {
  const response = await fetch(
    `${API_URL}/api/presigned-url/${encodeURIComponent(fileName)}`
  );
  const { url } = await response.json();
  if (!response.ok) {
    ToastAndroid.show("Network error", ToastAndroid.SHORT);
    throw new Error("Network response was not ok");
  }
  const output = await storeFile(fileName, url);
  return output.uri;
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
  const filePath = `${APP_FOLDER}/${fileName}`;
  const exists = await RNFS.exists(filePath);
  if (exists) {
    try {
      return `file://${filePath}`;
    } catch (error) {
      ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
      console.error("Error reading file from cache:", error);
      await RNFS.unlink(filePath).catch(() => {});
    }
  }

  try {
    const resultUri = await fetchFromAPI(fileName);
    return resultUri;
  } catch (error) {
    ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
    console.error("Error generating presigned URL:", error);
    return null;
  }
};

const reloadSource = async (fileName) => {
  const filePath = `${APP_FOLDER}/${fileName}`;
  const exists = await RNFS.exists(filePath);
  if (exists) {
    await RNFS.unlink(filePath).catch(() => {});
  }
  fetchFromAPI(fileName);
};

export { listFiles, getSource, reloadSource };
