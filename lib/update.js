import * as Updates from "expo-updates";
import * as Network from "expo-network";
import { ToastAndroid } from "react-native";

export async function checkUpdate() {
  const networkState = await Network.getNetworkStateAsync();
  if (networkState.isConnected) {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        ToastAndroid.show("Updating...", ToastAndroid.LONG);
        await Updates.fetchUpdateAsync();
        ToastAndroid.show("Reloading...", ToastAndroid.LONG);
        await Updates.reloadAsync();
        ToastAndroid.show("Updated!", ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show(`Error: ${error}`, ToastAndroid.SHORT);
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }
}
