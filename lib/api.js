import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import RNFS from "react-native-fs";
import { ToastAndroid } from "react-native";
import AWS from "aws-sdk";

const APP_FOLDER = `${RNFS.ExternalDirectoryPath}`;

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: "ap-southeast-1",
});

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

const getPresignedUrl = async (fileName) => {
  const params = {
    Bucket: "YOUR_BUCKET_NAME", // Thay bằng tên bucket của bạn
    Key: fileName,
    Expires: 60, // Thời gian hết hạn của URL (tính bằng giây)
  };

  return s3.getSignedUrlPromise("getObject", params);
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
    const presignedUrl = await getPresignedUrl(fileName);
    const resultUri = await storeFile(fileName, presignedUrl);
    return resultUri.uri;
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
  const presignedUrl = await getPresignedUrl(fileName);
  await storeFile(fileName, presignedUrl);
};

export { listFiles, getSource, reloadSource };
