import { View, Button, Text } from "react-native";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";

export default function Updater() {
  const [updating, setUpdating] = useState(false);
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdating(true);
        await Updates.fetchUpdateAsync();
        setUpdating(false);
        await Updates.reloadAsync();
      }
    } catch (error) {
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, []);

  return <View>{updating && <Text>Updating...</Text>}</View>;
}
