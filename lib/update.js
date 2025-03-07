import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { ToastAndroid } from "react-native";

export default function checkUpdate() {
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        ToastAndroid.show("Updating...", ToastAndroid.SHORT);
        await Updates.fetchUpdateAsync();
        ToastAndroid.show("Update completed", ToastAndroid.SHORT);
        await Updates.reloadAsync();
      }
    } catch (error) {
      ToastAndroid.show(
        `Error fetching latest Expo update: ${error}`,
        ToastAndroid.SHORT
      );
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }
  useEffect(() => {
    onFetchUpdateAsync();
  }, []);
}
