import { View, Button, Text } from "react-native";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { ToastAndroid } from "react-native";

export default function Updater() {
  const [updating, setUpdating] = useState(false);
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdating(true);
        ToastAndroid.show("Updating...", ToastAndroid.SHORT);
        await Updates.fetchUpdateAsync();
        setUpdating(false);
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

  return <View>{updating && <Text>Updating...</Text>}</View>;
}
